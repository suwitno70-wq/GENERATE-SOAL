import React, { useState, useEffect } from 'react';
import { Navbar, BottomNav } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { GeneratorWizard } from './components/GeneratorWizard';
import { QuickGeneratorModal } from './components/QuickGeneratorModal';
import { ImageStimulusModal } from './components/ImageStimulusModal';
import { KisiKisiView } from './components/KisiKisiView';
import { BankSoalView } from './components/BankSoalView';
import { NaskahView } from './components/NaskahView';
import { SettingsView } from './components/SettingsView';

import { 
  DEFAULT_MADRASAH, 
  SAMPLE_KISI_KISI_DOKUMEN, 
  SAMPLE_BANK_SOAL, 
  SAMPLE_NASKAH_DOKUMEN, 
  SAMPLE_LOGS 
} from './data/defaultData';
import { 
  MadrasahProfile, 
  NaskahSoalDocument, 
  SoalItem, 
  KisiKisiDokumen, 
  ActivityLog, 
  UserRole 
} from './types';
import { generateUniqueId } from './services/api';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('GURU');

  // Modals
  const [isQuickGenOpen, setIsQuickGenOpen] = useState(false);
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);

  // Core Data Persistent States
  const [madrasah, setMadrasah] = useState<MadrasahProfile>(() => {
    try {
      const saved = localStorage.getItem('madrasah_profile_v1');
      return saved ? JSON.parse(saved) : DEFAULT_MADRASAH;
    } catch {
      return DEFAULT_MADRASAH;
    }
  });

  const [bankSoal, setBankSoal] = useState<SoalItem[]>(() => {
    try {
      const saved = localStorage.getItem('bank_soal_mi_v1');
      return saved ? JSON.parse(saved) : SAMPLE_BANK_SOAL;
    } catch {
      return SAMPLE_BANK_SOAL;
    }
  });

  const [naskahList, setNaskahList] = useState<NaskahSoalDocument[]>(() => {
    try {
      const saved = localStorage.getItem('naskah_soal_mi_v1');
      return saved ? JSON.parse(saved) : SAMPLE_NASKAH_DOKUMEN;
    } catch {
      return SAMPLE_NASKAH_DOKUMEN;
    }
  });

  const [kisiKisiList, setKisiKisiList] = useState<KisiKisiDokumen[]>(() => {
    try {
      const saved = localStorage.getItem('kisi_kisi_mi_v1');
      return saved ? JSON.parse(saved) : SAMPLE_KISI_KISI_DOKUMEN;
    } catch {
      return SAMPLE_KISI_KISI_DOKUMEN;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('activity_logs_mi_v1');
      return saved ? JSON.parse(saved) : SAMPLE_LOGS;
    } catch {
      return SAMPLE_LOGS;
    }
  });

  // Draft Generator State
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftState, setDraftState] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('draft_soal_mi_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.identitas && (parsed.kisiKisi?.length > 0 || parsed.soalList?.length > 0)) {
          setHasSavedDraft(true);
          setDraftState(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load draft:', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('madrasah_profile_v1', JSON.stringify(madrasah));
    } catch {}
  }, [madrasah]);

  useEffect(() => {
    try {
      localStorage.setItem('bank_soal_mi_v1', JSON.stringify(bankSoal));
    } catch {}
  }, [bankSoal]);

  useEffect(() => {
    try {
      localStorage.setItem('naskah_soal_mi_v1', JSON.stringify(naskahList));
    } catch {}
  }, [naskahList]);

  useEffect(() => {
    try {
      localStorage.setItem('kisi_kisi_mi_v1', JSON.stringify(kisiKisiList));
    } catch {}
  }, [kisiKisiList]);

  useEffect(() => {
    try {
      localStorage.setItem('activity_logs_mi_v1', JSON.stringify(activityLogs));
    } catch {}
  }, [activityLogs]);

  // Activity Logger Helper
  const addLog = (aktivitas: string, detail: string) => {
    const newLog: ActivityLog = {
      id: generateUniqueId('LOG'),
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      aktivitas,
      detail,
      user: currentRole === 'GURU' ? 'Guru Pengampu' : currentRole === 'ADMIN' ? 'Admin Asesmen' : 'Kepala Madrasah',
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Handlers for Saving
  const handleSaveNaskah = (naskah: NaskahSoalDocument) => {
    setNaskahList((prev) => [naskah, ...prev]);

    // Also register Kisi-Kisi Dokumen if not exists
    const kisiDoc: KisiKisiDokumen = {
      id: generateUniqueId('KISI'),
      judul: `Kisi-Kisi ${naskah.identitas.judul}`,
      mapel: naskah.identitas.mapel,
      kelas: naskah.identitas.kelas,
      fase: naskah.identitas.fase,
      semester: naskah.identitas.semester,
      materiPokok: naskah.kisiKisi[0]?.materi || 'Materi Pokok Asesmen',
      guru: naskah.identitas.guru,
      items: naskah.kisiKisi,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setKisiKisiList((prev) => [kisiDoc, ...prev]);

    addLog('Simpan Naskah', `Menyimpan ${naskah.identitas.judul} (${naskah.identitas.mapel})`);
    try {
      localStorage.removeItem('draft_soal_mi_v1');
      setHasSavedDraft(false);
      setDraftState(null);
    } catch {}
  };

  const handleSaveToBankSoal = (items: SoalItem[]) => {
    setBankSoal((prev) => {
      // Prevent duplicates by ID
      const existingIds = new Set(prev.map((i) => i.id));
      const newItems = items.filter((i) => !existingIds.has(i.id));
      return [...newItems, ...prev];
    });
    addLog('Arsip Bank Soal', `Menambahkan ${items.length} butir soal ke Bank Soal`);
  };

  const handleMakeNaskahFromBank = (selectedItems: SoalItem[], paketName: string) => {
    const firstItem = selectedItems[0];
    const newDoc: NaskahSoalDocument = {
      id: generateUniqueId('NASKAH'),
      identitas: {
        judul: `ASESMEN SOAL DARI BANK SOAL (${paketName})`,
        madrasah: madrasah.namaMadrasah,
        tahunPelajaran: '2026/2027',
        semester: '1 (Ganjil)',
        kelas: '4',
        fase: 'Fase B',
        mapel: firstItem?.materi ? "Fikih / Akidah Akhlak" : "Asesmen Madrasah",
        guru: 'Guru Pengampu MI',
        jenisAsesmen: 'Sumatif Lingkup Materi (UH)',
        alokasiWaktu: '60 Menit',
        kurikulum: 'Kurikulum Merdeka',
        paket: paketName as any,
        tanggalPelaksanaan: new Date().toISOString().slice(0, 10),
      },
      kisiKisi: selectedItems.map((s, idx) => ({
        id: generateUniqueId('KISI'),
        nomor: idx + 1,
        nomorSoal: idx + 1,
        tp: s.tp || 'Tujuan Pembelajaran',
        materi: s.materi || 'Materi Pokok',
        indikator: s.indikator || 'Indikator Soal',
        levelKognitif: s.levelKognitif,
        kesulitan: s.kesulitan,
        bentukSoal: s.bentukSoal,
        skorMaksimal: s.skor || 1,
      })),
      daftarSoal: selectedItems,
      petunjukUmum: [
        'Berdoalah sebelum mengerjakan soal.',
        'Pilihlah jawaban yang paling tepat dan cermat.',
      ],
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'TERVALIDASI',
    };
    setNaskahList((prev) => [newDoc, ...prev]);
    setActiveTab('naskah');
    addLog('Rancang Paket Baru', `Membuat dokumen ${paketName} dengan ${selectedItems.length} butir`);
  };

  const handleResumeDraft = () => {
    setActiveTab('generator');
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem('draft_soal_mi_v1');
    } catch {}
    setHasSavedDraft(false);
    setDraftState(null);
    addLog('Reset Draft', 'Menghapus sesi draft yang belum selesai');
  };

  const handleRestoreDatabase = (backup: any) => {
    if (backup.madrasah) setMadrasah(backup.madrasah);
    if (backup.bankSoal) setBankSoal(backup.bankSoal);
    if (backup.naskahList) setNaskahList(backup.naskahList);
    if (backup.kisiKisiList) setKisiKisiList(backup.kisiKisiList);
    if (backup.activityLogs) setActivityLogs(backup.activityLogs);
    addLog('Pemulihan Database', 'Berhasil memulihkan seluruh data aplikasi');
  };

  // Compute Stats for Dashboard
  const stats = {
    totalNaskah: naskahList.length,
    totalSoal: bankSoal.length,
    totalBankSoal: bankSoal.length,
    totalKisiKisi: kisiKisiList.length,
    soalValid: bankSoal.filter((s) => s.statusValidasi === 'LAYAK').length,
    soalPerluRevisi: bankSoal.filter((s) => s.statusValidasi === 'PERLU_REVISI').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onOpenQuickGen={() => setIsQuickGenOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            hasSavedDraft={hasSavedDraft}
            onResumeDraft={handleResumeDraft}
            onDiscardDraft={handleDiscardDraft}
            onStartGenerator={() => setActiveTab('generator')}
            onOpenQuickGen={() => setIsQuickGenOpen(true)}
            onOpenImageGen={() => setIsImageGenOpen(true)}
            onNavigateTab={setActiveTab}
            recentNaskah={naskahList}
            activityLogs={activityLogs}
            currentRole={currentRole}
            madrasah={madrasah}
          />
        )}

        {activeTab === 'generator' && (
          <GeneratorWizard
            madrasah={madrasah}
            onSaveNaskah={handleSaveNaskah}
            onSaveToBankSoal={handleSaveToBankSoal}
            initialState={draftState}
            onStateChange={(st) => {
              setDraftState(st);
              setHasSavedDraft(true);
            }}
            onFinish={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'kisikisi' && (
          <KisiKisiView
            kisiKisiList={kisiKisiList}
            onStartGenerator={() => setActiveTab('generator')}
            madrasah={madrasah}
            onDeleteKisiKisi={(id) => {
              setKisiKisiList((prev) => prev.filter((k) => k.id !== id));
              addLog('Hapus Kisi-Kisi', `Menghapus dokumen kisi-kisi ${id}`);
            }}
          />
        )}

        {activeTab === 'banksoal' && (
          <BankSoalView
            bankSoal={bankSoal}
            onUpdateBankSoal={(items) => {
              setBankSoal(items);
              addLog('Perbarui Bank Soal', `Memperbarui koleksi bank soal`);
            }}
            onMakeNaskahFromSelected={handleMakeNaskahFromBank}
            madrasah={madrasah}
          />
        )}

        {activeTab === 'naskah' && (
          <NaskahView
            naskahList={naskahList}
            madrasah={madrasah}
            onDeleteNaskah={(id) => {
              setNaskahList((prev) => prev.filter((n) => n.id !== id));
              addLog('Hapus Naskah', `Menghapus dokumen naskah ${id}`);
            }}
            onStartGenerator={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'pengaturan' && (
          <SettingsView
            madrasah={madrasah}
            onUpdateMadrasah={(prof) => {
              setMadrasah(prof);
              addLog('Update Profil', `Memperbarui data profil madrasah`);
            }}
            bankSoal={bankSoal}
            naskahList={naskahList}
            kisiKisiList={kisiKisiList}
            activityLogs={activityLogs}
            onRestoreDatabase={handleRestoreDatabase}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickGen={() => setIsQuickGenOpen(true)}
      />

      {/* Quick Generator Modal */}
      <QuickGeneratorModal
        isOpen={isQuickGenOpen}
        onClose={() => setIsQuickGenOpen(false)}
        madrasah={madrasah}
        onSendToBankSoal={handleSaveToBankSoal}
      />

      {/* Image Stimulus Modal */}
      <ImageStimulusModal
        isOpen={isImageGenOpen}
        onClose={() => setIsImageGenOpen(false)}
        onAddSoal={(newSoal) => {
          handleSaveToBankSoal([newSoal]);
          setIsImageGenOpen(false);
          setActiveTab('banksoal');
          alert('Soal berbasis gambar berhasil dibuat dan ditambahkan ke Bank Soal!');
        }}
      />
    </div>
  );
}
