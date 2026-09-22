import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Copy, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Download, 
  Printer, 
  HelpCircle, 
  Eye, 
  Edit3, 
  Layers, 
  BookOpen, 
  Info,
  Calendar,
  Save,
  Flame,
  Search
} from 'lucide-react';
import { 
  NaskahIdentitas, 
  KisiKisiItem, 
  SoalItem, 
  ValidasiDetail, 
  BentukSoal, 
  LevelKognitif, 
  TingkatKesulitan, 
  MadrasahProfile,
  NaskahSoalDocument,
  JenjangKelas,
  Fase
} from '../types';
import { DAFTAR_MAPEL, MASTER_CP, MASTER_TP } from '../data/defaultData';
import { 
  apiFetchCurriculumDraft, 
  apiGenerateKisiKisi, 
  apiGenerateSoal, 
  apiRegenerateSingleSoal, 
  apiValidateSoal,
  exportToWordDoc,
  exportKisiKisiToCsv,
  generateUniqueId
} from '../services/api';

interface GeneratorWizardProps {
  madrasah: MadrasahProfile;
  onSaveNaskah: (naskah: NaskahSoalDocument) => void;
  onSaveToBankSoal: (items: SoalItem[]) => void;
  initialState?: any;
  onStateChange?: (state: any) => void;
  onFinish: () => void;
}

const STEP_LABELS = [
  'Identitas',
  'Kurikulum',
  'Materi',
  'Kisi-Kisi',
  'Komposisi',
  'Generate AI',
  'Validasi',
  'Review',
  'Simpan',
  'Export'
];

export const GeneratorWizard: React.FC<GeneratorWizardProps> = ({
  madrasah,
  onSaveNaskah,
  onSaveToBankSoal,
  initialState,
  onStateChange,
  onFinish
}) => {
  const [step, setStep] = useState<number>(initialState?.currentStep || 1);

  // Step 1: Identitas
  const [identitas, setIdentitas] = useState<NaskahIdentitas>(
    initialState?.identitas || {
      judul: 'ASESMEN SUMATIF AKHIR SEMESTER',
      madrasah: madrasah.namaMadrasah,
      tahunPelajaran: '2026/2027',
      semester: '1 (Ganjil)',
      kelas: '4',
      fase: 'Fase B',
      mapel: "Al-Qur'an Hadis",
      guru: 'Guru Pengampu MI, S.Pd.I',
      nipGuru: '198905202020121004',
      jenisAsesmen: 'Sumatif Lingkup Materi (UH)',
      alokasiWaktu: '60 Menit',
      kurikulum: 'Kurikulum Madrasah (KMA 1503)',
      paket: 'Paket A',
      tanggalPelaksanaan: new Date().toISOString().slice(0, 10),
    }
  );

  // Step 2: Kurikulum
  const [cp, setCp] = useState<string>(initialState?.cp || '');
  const [tp, setTp] = useState<string>(initialState?.tp || '');
  const [atp, setAtp] = useState<string>(initialState?.atp || '');
  const [elemen, setElemen] = useState<string>('Materi Pokok');
  const [isDraftingCurriculum, setIsDraftingCurriculum] = useState(false);
  const [curriculumNotice, setCurriculumNotice] = useState<string>('');

  // Step 3: Materi
  const [bab, setBab] = useState<string>(initialState?.bab || 'Bab 1');
  const [materiPokok, setMateriPokok] = useState<string>(initialState?.materiPokok || 'Ketentuan Wudhu dan Tayamum');
  const [submateri, setSubmateri] = useState<string>(initialState?.submateri || 'Rukun, Syarat, dan Hal yang Membatalkan');
  const [stimulusTeks, setStimulusTeks] = useState<string>(initialState?.stimulusTeks || '');

  // Step 4 & 5: Kisi-kisi & Komposisi
  const [komposisi, setKomposisi] = useState<Record<string, number>>(
    initialState?.komposisi || {
      'Pilihan Ganda': 10,
      'Pilihan Ganda Kompleks': 2,
      'Isian Singkat': 3,
      'Uraian': 2,
    }
  );
  const [isHots, setIsHots] = useState<boolean>(initialState?.isHots ?? true);
  const [kisiKisi, setKisiKisi] = useState<KisiKisiItem[]>(initialState?.kisiKisi || []);
  const [isGeneratingKisiKisi, setIsGeneratingKisiKisi] = useState(false);

  // Step 6, 7, 8: Soal, Validasi, Review
  const [soalList, setSoalList] = useState<SoalItem[]>(initialState?.soalList || []);
  const [isGeneratingSoal, setIsGeneratingSoal] = useState(false);
  const [validasiResults, setValidasiResults] = useState<Record<number, ValidasiDetail>>(
    initialState?.validasiResults || {}
  );
  const [isValidating, setIsValidating] = useState(false);
  const [editingSoalIndex, setEditingSoalIndex] = useState<number | null>(null);
  const [regeneratingNumber, setRegeneratingNumber] = useState<number | null>(null);

  // Step 10: Preview tab
  const [previewTab, setPreviewTab] = useState<'soal' | 'kisikisi' | 'kunci' | 'pembahasan'>('soal');

  // Sync Fase saat Kelas berubah
  const handleKelasChange = (newKelas: JenjangKelas) => {
    let newFase: Fase = 'Fase A';
    if (newKelas === '3' || newKelas === '4') newFase = 'Fase B';
    if (newKelas === '5' || newKelas === '6') newFase = 'Fase C';
    setIdentitas({ ...identitas, kelas: newKelas, fase: newFase });
  };

  // Hitung total butir soal dari komposisi
  const totalJumlahSoal = Object.values(komposisi).reduce((a, b) => a + Number(b || 0), 0);

  // Simpan draft otomatis ke localStorage
  useEffect(() => {
    const currentState = {
      currentStep: step,
      identitas,
      cp,
      tp,
      atp,
      bab,
      materiPokok,
      submateri,
      stimulusTeks,
      komposisi,
      isHots,
      kisiKisi,
      soalList,
      validasiResults,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('draft_soal_mi_v1', JSON.stringify(currentState));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    if (onStateChange) onStateChange(currentState);
  }, [step, identitas, cp, tp, atp, bab, materiPokok, submateri, stimulusTeks, komposisi, isHots, kisiKisi, soalList, validasiResults]);

  // Load standard CP/TP jika kosong saat mapel berubah
  useEffect(() => {
    if (!cp) {
      const match = MASTER_CP.find(
        (c) => c.mapel.toLowerCase() === identitas.mapel.toLowerCase() && c.fase === identitas.fase
      );
      if (match) {
        setCp(match.cp);
        setElemen(match.elemen);
      }
    }
    if (!tp) {
      const matchTp = MASTER_TP.find(
        (t) => t.mapel.toLowerCase() === identitas.mapel.toLowerCase() && t.kelas === identitas.kelas
      );
      if (matchTp) {
        setTp(matchTp.tp);
        setMateriPokok(matchTp.materi);
      }
    }
  }, [identitas.mapel, identitas.kelas]);

  // ACTION: BANTU AI Kurikulum
  const handleBantuAiKurikulum = async () => {
    setIsDraftingCurriculum(true);
    setCurriculumNotice('');
    try {
      const res = await apiFetchCurriculumDraft({
        mapel: identitas.mapel,
        kelas: identitas.kelas,
        fase: identitas.fase,
        kurikulum: identitas.kurikulum,
        topikMateri: materiPokok || 'Ketentuan Fikih dan Ibadah',
        elemen,
      });
      if (res.cp) setCp(res.cp);
      if (res.tp && res.tp.length > 0) {
        setTp(res.tp.map((t) => `${t.nomor}. ${t.tujuan}`).join('\n'));
      }
      if (res.atp && res.atp.length > 0) {
        setAtp(res.atp.map((a) => `${a.urutan}. ${a.alur}`).join('\n'));
      }
      setCurriculumNotice('Draft AI — wajib ditinjau dan disesuaikan guru.');
    } catch (err: any) {
      alert('Maaf, bantuan AI kurikulum belum berhasil. Silakan coba lagi.');
    } finally {
      setIsDraftingCurriculum(false);
    }
  };

  // ACTION: Generate Kisi-Kisi AI
  const handleGenerateKisiKisi = async () => {
    setIsGeneratingKisiKisi(true);
    try {
      const items = await apiGenerateKisiKisi({
        identitas,
        cp,
        tp,
        materi: materiPokok,
        komposisi,
        distribusiKognitif: { mode: 'otomatis' },
        distribusiKesulitan: { mode: 'otomatis' },
        isHots,
      });
      setKisiKisi(items);
    } catch (err) {
      alert('Gagal generate kisi-kisi.');
    } finally {
      setIsGeneratingKisiKisi(false);
    }
  };

  // ACTION: Generate Soal AI
  const handleGenerateSoal = async () => {
    if (kisiKisi.length === 0) {
      alert('Silakan buat kisi-kisi terlebih dahulu pada Langkah 4.');
      setStep(4);
      return;
    }
    setIsGeneratingSoal(true);
    try {
      const items = await apiGenerateSoal({
        identitas,
        kisiKisi,
        isHots,
        stimulusKhusus: stimulusTeks,
      });
      setSoalList(items);
      setStep(7); // Lanjut ke validasi otomatis
    } catch (err) {
      alert('Maaf, proses AI belum berhasil. Silakan coba lagi.');
    } finally {
      setIsGeneratingSoal(false);
    }
  };

  // ACTION: Validasi Soal AI
  const handleRunValidation = async () => {
    if (soalList.length === 0) {
      alert('Belum ada butir soal untuk divalidasi.');
      return;
    }
    setIsValidating(true);
    try {
      const results = await apiValidateSoal({
        soalList,
        identitas,
      });
      setValidasiResults(results);
    } catch (err) {
      alert('Validasi AI belum berhasil.');
    } finally {
      setIsValidating(false);
    }
  };

  // ACTION: Regenerate Satu Soal
  const handleRegenerateSingle = async (nomorSoal: number) => {
    const targetKisi = kisiKisi.find((k) => k.nomorSoal === nomorSoal) || kisiKisi[nomorSoal - 1];
    if (!targetKisi) return;

    setRegeneratingNumber(nomorSoal);
    try {
      const newItem = await apiRegenerateSingleSoal({
        nomorSoal,
        kisiItem: targetKisi,
        identitas,
        catatanGuru: 'Buat butir soal baru yang segar dan berbeda dengan tingkat kesulitan setara',
      });
      setSoalList((prev) => prev.map((s) => (s.nomor === nomorSoal ? newItem : s)));
      // Reset status validasi soal ini
      setValidasiResults((prev) => {
        const next = { ...prev };
        delete next[nomorSoal];
        return next;
      });
    } catch (err) {
      alert('Gagal meregenerasi butir ini.');
    } finally {
      setRegeneratingNumber(null);
    }
  };

  // Checklist Sebelum Export
  const checkHasAllKeys = soalList.every((s) => Boolean(s.kunciJawaban));
  const checkHasAllTp = soalList.every((s) => Boolean(s.tp));
  const checkHasAllIndikator = soalList.every((s) => Boolean(s.indikator));
  const checkNoEmptyQuestion = soalList.every((s) => Boolean(s.pertanyaan && s.pertanyaan.trim().length > 3));
  const checkIdentityComplete = Boolean(identitas.madrasah && identitas.mapel && identitas.guru);
  const checkValidationDone = Object.keys(validasiResults).length > 0;
  const isReadyToExport = checkHasAllKeys && checkHasAllTp && checkHasAllIndikator && checkNoEmptyQuestion && checkIdentityComplete;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-16">
      {/* Wizard Step Navigation Bar (Mobile-friendly horizontal scroll) */}
      <div className="bg-emerald-900 text-white px-3 py-3 overflow-x-auto scrollbar-thin">
        <div className="flex items-center justify-between min-w-[720px] max-w-5xl mx-auto px-2">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => setStep(stepNum)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950 shadow-md font-bold'
                      : isCompleted
                      ? 'bg-emerald-700/80 text-emerald-100 hover:bg-emerald-700'
                      : 'text-emerald-300 hover:text-white'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? 'bg-emerald-950 text-amber-300' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-emerald-800 text-emerald-200'
                  }`}>
                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : stepNum}
                  </span>
                  <span>{label}</span>
                </button>
                {stepNum < STEP_LABELS.length && (
                  <span className="text-emerald-600 mx-1 text-xs">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Content Container */}
      <div className="p-4 sm:p-7 max-w-5xl mx-auto min-h-[480px]">
        {/* ================= STEP 1: IDENTITAS ================= */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                Identitas Asesmen Madrasah
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan madrasah, mata pelajaran, jenjang kelas, alokasi waktu, dan jenis asesmen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Madrasah</label>
                <input
                  type="text"
                  value={identitas.madrasah}
                  onChange={(e) => setIdentitas({ ...identitas, madrasah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Dokumen Asesmen</label>
                <input
                  type="text"
                  value={identitas.judul}
                  onChange={(e) => setIdentitas({ ...identitas, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={identitas.mapel}
                  onChange={(e) => setIdentitas({ ...identitas, mapel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <optgroup label="Pendidikan Agama Islam (PAI Kemenag)">
                    {DAFTAR_MAPEL.filter(m => m.kategori === 'PAI').map(m => (
                      <option key={m.id} value={m.nama}>{m.nama}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Mata Pelajaran Umum">
                    {DAFTAR_MAPEL.filter(m => m.kategori === 'Umum').map(m => (
                      <option key={m.id} value={m.nama}>{m.nama}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Acuan Kurikulum</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Rekomendasi</span>
                </label>
                <select
                  value={identitas.kurikulum}
                  onChange={(e) => setIdentitas({ ...identitas, kurikulum: e.target.value as any })}
                  className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-950"
                >
                  <option value="Kurikulum Madrasah (KMA 1503)">Kurikulum Madrasah (KMA 1503 - Deep Learning & Panca Cinta)</option>
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Kurikulum Madrasah (KMA 347/450)">Kurikulum Madrasah (KMA 347/450)</option>
                  <option value="Custom">Custom / Mandiri</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas MI</label>
                  <select
                    value={identitas.kelas}
                    onChange={(e) => handleKelasChange(e.target.value as JenjangKelas)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="1">Kelas 1 (Fase A)</option>
                    <option value="2">Kelas 2 (Fase A)</option>
                    <option value="3">Kelas 3 (Fase B)</option>
                    <option value="4">Kelas 4 (Fase B)</option>
                    <option value="5">Kelas 5 (Fase C)</option>
                    <option value="6">Kelas 6 (Fase C)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={identitas.semester}
                    onChange={(e) => setIdentitas({ ...identitas, semester: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="1 (Ganjil)">1 (Ganjil)</option>
                    <option value="2 (Genap)">2 (Genap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Asesmen</label>
                <select
                  value={identitas.jenisAsesmen}
                  onChange={(e) => setIdentitas({ ...identitas, jenisAsesmen: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Latihan Harian">Latihan Harian</option>
                  <option value="Penilaian Formatif">Penilaian Formatif</option>
                  <option value="Sumatif Lingkup Materi (UH)">Sumatif Lingkup Materi (UH)</option>
                  <option value="Penilaian Tengah Semester (PTS/STS)">Penilaian Tengah Semester (PTS/STS)</option>
                  <option value="Penilaian Akhir Semester (PAS/SAS)">Penilaian Akhir Semester (PAS/SAS)</option>
                  <option value="Asesmen Madrasah (AM)">Asesmen Madrasah (AM)</option>
                  <option value="Remedial">Remedial</option>
                  <option value="Pengayaan">Pengayaan</option>
                  <option value="Try Out">Try Out</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alokasi Waktu</label>
                  <input
                    type="text"
                    value={identitas.alokasiWaktu}
                    onChange={(e) => setIdentitas({ ...identitas, alokasiWaktu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="mis. 60 Menit"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paket Soal</label>
                  <select
                    value={identitas.paket}
                    onChange={(e) => setIdentitas({ ...identitas, paket: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-800"
                  >
                    <option value="Paket A">Paket A</option>
                    <option value="Paket B">Paket B</option>
                    <option value="Paket C">Paket C</option>
                    <option value="Paket D">Paket D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Guru Pembuat</label>
                <input
                  type="text"
                  value={identitas.guru}
                  onChange={(e) => setIdentitas({ ...identitas, guru: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP / NIK Guru</label>
                <input
                  type="text"
                  value={identitas.nipGuru}
                  onChange={(e) => setIdentitas({ ...identitas, nipGuru: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="19890520..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: KURIKULUM ================= */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                  Kurikulum & Capaian Pembelajaran
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih acuan kurikulum madrasah dan rumuskan CP, TP, serta ATP.
                </p>
              </div>

              <button
                id="btn-bantu-ai-kurikulum"
                type="button"
                onClick={handleBantuAiKurikulum}
                disabled={isDraftingCurriculum}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50 self-start sm:self-auto"
              >
                <Sparkles className="w-4 h-4 text-emerald-950" />
                <span>{isDraftingCurriculum ? 'Menyusun Draft AI...' : '✨ BANTU AI Kurikulum'}</span>
              </button>
            </div>

            {curriculumNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold italic">{curriculumNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['Kurikulum Madrasah (KMA 1503)', 'Kurikulum Merdeka', 'Kurikulum Madrasah (KMA 347/450)', 'Custom'] as const).map((kuri) => {
                const isKma1503 = kuri === 'Kurikulum Madrasah (KMA 1503)';
                const isSelected = identitas.kurikulum === kuri;
                return (
                  <div
                    key={kuri}
                    onClick={() => setIdentitas({ ...identitas, kurikulum: kuri })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-xs sm:text-sm flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold">{kuri}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      {isKma1503 && (
                        <span className="inline-block mt-1 text-[10px] bg-emerald-200/80 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                          ⭐ Deep Learning & Panca Cinta
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* KMA 1503 Deep Learning & Panca Cinta Insight Box */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Landasan Kurikulum Madrasah: KMA Nomor 1503</span>
                </span>
                <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full">
                  KMA 1503
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Materi dan butir soal diarahkan pada <strong>Pembelajaran Mendalam (Deep Learning)</strong> guna menguji pemahaman konsep esensial, daya nalar kritis anak MI, dan integrasi <strong>Panca Cinta</strong>:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  '❤️ Cinta Allah & Rasul',
                  '📚 Cinta Ilmu Pengetahuan',
                  '🌱 Cinta Lingkungan & Alam',
                  '🤝 Cinta Diri & Sesama Manusia',
                  '🇮🇩 Cinta Tanah Air Indonesia',
                ].map((cinta) => (
                  <button
                    key={cinta}
                    type="button"
                    onClick={() => {
                      setMateriPokok((prev) => prev ? `${prev} (Muatan ${cinta.replace(/^[^\s]+\s/, '')})` : `Muatan ${cinta.replace(/^[^\s]+\s/, '')}`);
                    }}
                    className="text-[10px] bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium px-2 py-1 rounded-lg transition shadow-xs"
                    title="Klik untuk menambahkan nilai Panca Cinta ke fokus materi"
                  >
                    + {cinta}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Capaian Pembelajaran (CP) - {identitas.fase}
                </label>
                <textarea
                  rows={3}
                  value={cp}
                  onChange={(e) => setCp(e.target.value)}
                  placeholder="Rumusan Capaian Pembelajaran pada fase ini..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tujuan Pembelajaran (TP)
                </label>
                <textarea
                  rows={3}
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                  placeholder="Tujuan Pembelajaran yang akan diujikan pada asesmen ini..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alur Tujuan Pembelajaran (ATP) / Tahapan
                </label>
                <textarea
                  rows={2}
                  value={atp}
                  onChange={(e) => setAtp(e.target.value)}
                  placeholder="Alur tahapan pembelajaran..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: MATERI ================= */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                Materi & Stimulus Pembelajaran
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan ruang lingkup materi yang diujikan beserta stimulus narasi/konteks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bab / Unit</label>
                <input
                  type="text"
                  value={bab}
                  onChange={(e) => setBab(e.target.value)}
                  placeholder="mis. Bab 2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Materi Pokok</label>
                <input
                  type="text"
                  value={materiPokok}
                  onChange={(e) => setMateriPokok(e.target.value)}
                  placeholder="mis. Tanda-Tanda Balig Menurut Fikih"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Submateri / Ruang Lingkup</label>
                <input
                  type="text"
                  value={submateri}
                  onChange={(e) => setSubmateri(e.target.value)}
                  placeholder="mis. Mimpi basah, haid, usia 15 tahun, dan konsekuensi mukallaf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Stimulus Kontekstual Tambahan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={stimulusTeks}
                  onChange={(e) => setStimulusTeks(e.target.value)}
                  placeholder="Teks bacaan, cerita kehidupan madrasah, ayat/hadis pendek, atau studi kasus untuk acuan AI..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Bila diisi, AI akan memprioritaskan soal-soal berdasar stimulus cerita/konteks ini.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: KISI-KISI ================= */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                  Matriks Kisi-Kisi Asesmen MI
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tabel pemetaan TP, materi, indikator soal, kognitif, dan bentuk soal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateKisiKisi}
                  disabled={isGeneratingKisiKisi}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingKisiKisi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingKisiKisi ? 'Membuat Matriks...' : '✨ GENERATE KISI-KISI'}</span>
                </button>
                {kisiKisi.length > 0 && (
                  <button
                    type="button"
                    onClick={() => exportKisiKisiToCsv(kisiKisi, identitas)}
                    className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs"
                    title="Download Excel / CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {kisiKisi.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">Kisi-Kisi Belum Dibuat</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Klik tombol <strong>"GENERATE KISI-KISI"</strong> di atas agar AI menyusun tabel indikator secara otomatis sesuai komposisi dan materi.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateKisiKisi}
                  disabled={isGeneratingKisiKisi}
                  className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-xl text-xs"
                >
                  Buat Kisi-Kisi Sekarang
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-10">No</th>
                      <th className="p-2.5 min-w-[150px]">Tujuan Pembelajaran</th>
                      <th className="p-2.5 min-w-[120px]">Materi</th>
                      <th className="p-2.5 min-w-[200px]">Indikator Soal</th>
                      <th className="p-2.5 text-center w-20">Level</th>
                      <th className="p-2.5 text-center w-20">Kesulitan</th>
                      <th className="p-2.5 min-w-[120px]">Bentuk</th>
                      <th className="p-2.5 text-center w-14">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kisiKisi.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5 text-center font-bold text-slate-600">{idx + 1}</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.tp}
                            onChange={(e) => {
                              const next = [...kisiKisi];
                              next[idx].tp = e.target.value;
                              setKisiKisi(next);
                            }}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-1 py-0.5"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.materi}
                            onChange={(e) => {
                              const next = [...kisiKisi];
                              next[idx].materi = e.target.value;
                              setKisiKisi(next);
                            }}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-1 py-0.5"
                          />
                        </td>
                        <td className="p-2.5">
                          <textarea
                            rows={2}
                            value={item.indikator}
                            onChange={(e) => {
                              const next = [...kisiKisi];
                              next[idx].indikator = e.target.value;
                              setKisiKisi(next);
                            }}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-1 py-0.5 text-[11px]"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <select
                            value={item.levelKognitif}
                            onChange={(e) => {
                              const next = [...kisiKisi];
                              next[idx].levelKognitif = e.target.value as LevelKognitif;
                              setKisiKisi(next);
                            }}
                            className="text-[11px] font-bold bg-white border border-slate-200 rounded px-1 py-0.5 text-emerald-800"
                          >
                            <option value="C1">C1</option>
                            <option value="C2">C2</option>
                            <option value="C3">C3</option>
                            <option value="C4">C4</option>
                            <option value="C5">C5</option>
                            <option value="C6">C6</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-center">
                          <select
                            value={item.kesulitan}
                            onChange={(e) => {
                              const next = [...kisiKisi];
                              next[idx].kesulitan = e.target.value as TingkatKesulitan;
                              setKisiKisi(next);
                            }}
                            className="text-[11px] bg-white border border-slate-200 rounded px-1 py-0.5"
                          >
                            <option value="Mudah">Mudah</option>
                            <option value="Sedang">Sedang</option>
                            <option value="Sulit">Sulit</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <span className="inline-block text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {item.bentukSoal}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setKisiKisi(kisiKisi.filter((_, i) => i !== idx));
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 5: KOMPOSISI SOAL ================= */}
        {step === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                Komposisi & Distribusi Soal
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan variasi bentuk soal, kuota jumlah butir, dan mode HOTS.
              </p>
            </div>

            {/* HOTS Switch */}
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">Mode Soal HOTS (Higher Order Thinking Skills)</h4>
                  <p className="text-xs text-amber-800">
                    Meningkatkan tuntutan berpikir kritis (C4 Menganalisis, C5 Mengevaluasi, C6 Berkreasi) yang disesuaikan dengan daya tangkap siswa MI.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHots}
                  onChange={(e) => setIsHots(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Bentuk Soal Inputs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Jumlah Soal Per Bentuk:</h3>
                <div className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300">
                  Total: {totalJumlahSoal} Butir Soal
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {[
                  'Pilihan Ganda',
                  'Pilihan Ganda Kompleks',
                  'Benar/Salah',
                  'Menjodohkan',
                  'Isian Singkat',
                  'Isian',
                  'Uraian',
                  'Essay',
                  'Studi Kasus',
                  'Literasi',
                  'Numerasi',
                  'Soal Berbasis Gambar',
                ].map((b) => (
                  <div key={b} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                    <span className="font-semibold text-slate-700">{b}</span>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Jumlah:</span>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={komposisi[b] || 0}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setKomposisi({ ...komposisi, [b]: val });
                        }}
                        className="w-16 px-2 py-1 text-center font-bold text-emerald-900 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: GENERATE AI ================= */}
        {step === 6 && (
          <div className="space-y-6 text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-8 h-8 text-emerald-700" />
            </div>

            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-extrabold text-slate-900">
                Siap Menghasilkan Butir Soal AI?
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                AI akan membaca seluruh kisi-kisi ({kisiKisi.length} butir) dan menuliskan naskah soal lengkap dengan stimulus, pilihan distraktor yang logis, kunci jawaban pasti, serta pembahasan pedagogis.
              </p>
            </div>

            <div className="max-w-lg mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Mata Pelajaran:</span>
                <span className="font-bold text-slate-800">{identitas.mapel} (Kelas {identitas.kelas} MI)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Materi Pokok:</span>
                <span className="font-bold text-slate-800">{materiPokok}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Kisi-Kisi:</span>
                <span className="font-bold text-emerald-700">{kisiKisi.length} Butir Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mode HOTS:</span>
                <span className={`font-bold ${isHots ? 'text-amber-600' : 'text-slate-600'}`}>
                  {isHots ? 'Aktif (C4-C6)' : 'Standar'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                id="btn-trigger-generate-soal"
                onClick={handleGenerateSoal}
                disabled={isGeneratingSoal}
                className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Sparkles className={`w-5 h-5 text-amber-300 ${isGeneratingSoal ? 'animate-spin' : ''}`} />
                <span>{isGeneratingSoal ? 'Sedang Menyusun Naskah Soal MI...' : '✨ GENERATE SOAL SEKARANG'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 7: VALIDASI ================= */}
        {step === 7 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                  Validasi Mutu Soal AI (12 Rubrik)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemeriksaan kelayakan materi, bahasa anak MI, ketepatan kunci, dan ambiguitas soal.
                </p>
              </div>

              <button
                type="button"
                id="btn-run-validation"
                onClick={handleRunValidation}
                disabled={isValidating || soalList.length === 0}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                <span>{isValidating ? 'Sedang Menelaah Butir...' : '🔍 VALIDASI SOAL AI'}</span>
              </button>
            </div>

            {Object.keys(validasiResults).length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Soal telah berhasil dibuat! Klik <strong>"VALIDASI SOAL AI"</strong> untuk memastikan semua butir memenuhi 12 standar asesmen mutu madrasah.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {soalList.map((soal) => {
                  const val = validasiResults[soal.nomor];
                  const isLayak = val?.status === 'LAYAK';
                  const isRevisi = val?.status === 'PERLU_REVISI';

                  return (
                    <div
                      key={soal.id}
                      className={`p-4 rounded-xl border transition ${
                        isLayak
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : isRevisi
                          ? 'border-amber-200 bg-amber-50/40'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs bg-slate-800 text-white w-6 h-6 rounded-md flex items-center justify-center">
                            {soal.nomor}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            {soal.bentukSoal} ({soal.levelKognitif} - {soal.kesulitan})
                          </span>
                        </div>

                        {val ? (
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                            isLayak
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isLayak ? '🟢 LAYAK' : isRevisi ? '🟡 PERLU REVISI' : '🔴 TIDAK LAYAK'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Belum ditelaah</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 mt-2 line-clamp-2">
                        {soal.pertanyaan}
                      </p>

                      {val && (
                        <div className="mt-3 p-2.5 bg-white/80 rounded-lg border border-slate-200/80 text-[11px] space-y-1">
                          <div>
                            <span className="font-bold text-slate-700">Analisis Mutu: </span>
                            <span className="text-slate-600">{val.alasan}</span>
                          </div>
                          {val.saranPerbaikan && (
                            <div>
                              <span className="font-bold text-amber-800">Saran Guru: </span>
                              <span className="text-amber-900">{val.saranPerbaikan}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 8: REVIEW & REGENERATE PER BUTIR ================= */}
        {step === 8 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
                Review & Koreksi Butir Soal Guru
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Guru dapat mengedit langsung butir soal, atau meregenerasi <strong>1 butir tertentu saja</strong> tanpa merusak butir lainnya.
              </p>
            </div>

            <div className="space-y-4">
              {soalList.map((soal, idx) => (
                <div key={soal.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                        {soal.nomor}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{soal.bentukSoal}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {soal.levelKognitif} • {soal.kesulitan}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRegenerateSingle(soal.nomor)}
                        disabled={regeneratingNumber === soal.nomor}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1"
                        title="Buat ulang hanya butir ini"
                      >
                        <RefreshCw className={`w-3 h-3 ${regeneratingNumber === soal.nomor ? 'animate-spin' : ''}`} />
                        <span>Regenerate Butir #{soal.nomor}</span>
                      </button>
                    </div>
                  </div>

                  {/* Stimulus */}
                  {soal.stimulus && (
                    <div className="mb-2 p-2.5 bg-slate-50 border-l-2 border-emerald-600 rounded text-xs text-slate-700 italic">
                      {soal.stimulus}
                    </div>
                  )}

                  {/* Pertanyaan */}
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 mb-3">
                    <textarea
                      rows={2}
                      value={soal.pertanyaan}
                      onChange={(e) => {
                        const next = [...soalList];
                        next[idx].pertanyaan = e.target.value;
                        setSoalList(next);
                      }}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  {/* Pilihan Jawaban */}
                  {soal.pilihan && (
                    <div className="space-y-1.5 ml-2 text-xs mb-3">
                      {Object.entries(soal.pilihan).map(([huruf, teks]) => (
                        <div key={huruf} className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            soal.kunciJawaban?.includes(huruf)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {huruf}
                          </span>
                          <input
                            type="text"
                            value={teks}
                            onChange={(e) => {
                              const next = [...soalList];
                              if (next[idx].pilihan) {
                                next[idx].pilihan![huruf] = e.target.value;
                                setSoalList(next);
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Kunci & Pembahasan */}
                  <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-900">Kunci Jawaban:</span>
                      <input
                        type="text"
                        value={soal.kunciJawaban}
                        onChange={(e) => {
                          const next = [...soalList];
                          next[idx].kunciJawaban = e.target.value;
                          setSoalList(next);
                        }}
                        className="px-2 py-0.5 font-bold text-emerald-800 bg-white border border-emerald-300 rounded w-28 text-xs"
                      />
                      <span className="text-[11px] text-slate-400">Skor: {soal.skor}</span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-900">Pembahasan Pedagogis:</span>
                      <textarea
                        rows={2}
                        value={soal.pembahasan}
                        onChange={(e) => {
                          const next = [...soalList];
                          next[idx].pembahasan = e.target.value;
                          setSoalList(next);
                        }}
                        className="w-full mt-1 p-2 bg-white border border-emerald-200 rounded text-[11px] text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 9: SIMPAN ================= */}
        {step === 9 && (
          <div className="space-y-6 text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Save className="w-8 h-8 text-blue-700" />
            </div>

            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-extrabold text-slate-900">
                Simpan Naskah & Masukkan ke Bank Soal
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Naskah akan didokumentasikan dengan kode resmi dan seluruh {soalList.length} butir soal akan diarsipkan ke Bank Soal madrasah agar dapat digunakan kembali di masa mendatang.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Naskah Otomatis:</span>
                <span className="font-mono font-bold text-slate-900">{generateUniqueId('NASKAH')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Validasi:</span>
                <span className="font-bold text-emerald-700">🟢 TERVALIDASI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Bank Soal:</span>
                <span className="font-bold text-purple-700">{soalList.length} Butir Soal Baru</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  // Simpan ke State Utama
                  const doc: NaskahSoalDocument = {
                    id: generateUniqueId('NASKAH'),
                    identitas,
                    kisiKisi,
                    daftarSoal: soalList,
                    petunjukUmum: [
                      'Berdoalah kepada Allah SWT sebelum mulai mengerjakan soal.',
                      'Tuliskan nama lengkap, kelas, dan nomor absen pada lembar jawaban yang tersedia.',
                      'Bacalah setiap butir soal dengan cermat dan teliti sebelum menentukan jawaban.',
                      'Dahulukan menjawab soal-soal yang kamu anggap paling mudah.',
                      'Periksa kembali seluruh lembar jawabanmu sebelum diserahkan kepada Bapak/Ibu Guru.',
                    ],
                    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    status: 'TERVALIDASI',
                  };
                  onSaveNaskah(doc);
                  onSaveToBankSoal(soalList);
                  setStep(10); // Lanjut ke Export
                }}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Naskah & Lanjut ke Export</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 10: EXPORT & PREVIEW ================= */}
        {step === 10 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Checklist Sebelum Export */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Checklist Kelayakan Sebelum Cetak / Export:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={checkHasAllKeys ? 'text-emerald-600' : 'text-red-500'}>
                    {checkHasAllKeys ? '☑' : '☒'}
                  </span>
                  <span>Semua soal memiliki kunci</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={checkHasAllTp ? 'text-emerald-600' : 'text-red-500'}>
                    {checkHasAllTp ? '☑' : '☒'}
                  </span>
                  <span>Semua butir memiliki TP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={checkHasAllIndikator ? 'text-emerald-600' : 'text-red-500'}>
                    {checkHasAllIndikator ? '☑' : '☒'}
                  </span>
                  <span>Semua butir memiliki indikator</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={checkNoEmptyQuestion ? 'text-emerald-600' : 'text-red-500'}>
                    {checkNoEmptyQuestion ? '☑' : '☒'}
                  </span>
                  <span>Tidak ada pertanyaan kosong</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={checkIdentityComplete ? 'text-emerald-600' : 'text-red-500'}>
                    {checkIdentityComplete ? '☑' : '☒'}
                  </span>
                  <span>Identitas naskah lengkap</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={checkValidationDone ? 'text-emerald-600' : 'text-amber-500'}>
                    {checkValidationDone ? '☑' : '☒'}
                  </span>
                  <span>Validasi selesai</span>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950">
                  Naskah Siap Diunduh & Dicetak
                </h4>
                <p className="text-xs text-emerald-800">
                  Format A4 standar Kemenag RI, kompatibel dengan Microsoft Word, WPS Office, dan PDF Print.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-export-word"
                  onClick={() => {
                    const doc: NaskahSoalDocument = {
                      id: 'NASKAH-EXPORT',
                      identitas,
                      kisiKisi,
                      daftarSoal: soalList,
                      petunjukUmum: [
                        'Berdoalah kepada Allah SWT sebelum mulai mengerjakan soal.',
                        'Tuliskan nama lengkap, kelas, dan nomor absen pada lembar jawaban yang tersedia.',
                        'Bacalah setiap butir soal dengan cermat dan teliti sebelum menentukan jawaban.',
                        'Dahulukan menjawab soal-soal yang kamu anggap paling mudah.',
                        'Periksa kembali seluruh lembar jawabanmu sebelum diserahkan kepada Bapak/Ibu Guru.',
                      ],
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      status: 'TERVALIDASI',
                    };
                    exportToWordDoc(doc, madrasah, true, true);
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>📄 Export Word (.doc)</span>
                </button>

                <button
                  type="button"
                  id="btn-export-pdf"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>📕 Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>

            {/* Document Preview with 4-Tab Switcher */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1">
                {(['soal', 'kisikisi', 'kunci', 'pembahasan'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPreviewTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                      previewTab === t
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t === 'kisikisi' ? 'Kisi-Kisi' : t}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div className="p-6 bg-white min-h-[380px] text-slate-800 text-xs sm:text-sm font-serif">
                {previewTab === 'soal' && (
                  <div className="space-y-4 font-sans">
                    {/* Official Kemenag Kop */}
                    <div className="text-center border-b-2 border-double border-slate-800 pb-3 mb-4">
                      <p className="font-bold text-xs tracking-wider">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                      <h3 className="font-black text-sm sm:text-base text-emerald-900">{madrasah.namaMadrasah.toUpperCase()}</h3>
                      <p className="text-[10px] text-slate-500 italic">{madrasah.alamat}, {madrasah.kabupaten}</p>
                    </div>

                    <div className="text-center font-bold text-sm underline mb-3">
                      {identitas.judul.toUpperCase()} ({identitas.paket})
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div>Mata Pelajaran: <strong>{identitas.mapel}</strong></div>
                      <div>Kelas: <strong>Kelas {identitas.kelas} MI</strong></div>
                      <div>Alokasi Waktu: <strong>{identitas.alokasiWaktu}</strong></div>
                      <div>Semester: <strong>{identitas.semester}</strong></div>
                    </div>

                    <div className="space-y-3 font-sans">
                      {soalList.map((s) => (
                        <div key={s.id} className="pb-2 border-b border-slate-100 last:border-0">
                          <div className="flex items-start gap-2">
                            <span className="font-bold">{s.nomor}.</span>
                            <div className="flex-1">
                              {s.stimulus && (
                                <p className="text-slate-600 italic bg-slate-50 p-2 rounded mb-1 text-xs">
                                  {s.stimulus}
                                </p>
                              )}
                              <p className="font-medium text-slate-900">{s.pertanyaan}</p>
                              {s.pilihan && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 text-xs">
                                  {Object.entries(s.pilihan).map(([k, v]) => (
                                    <div key={k}>{k}. {v}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewTab === 'kisikisi' && (
                  <div className="font-sans">
                    <h4 className="font-bold text-sm mb-3">Matriks Kisi-Kisi Penulisan Soal</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="p-2 border">No</th>
                            <th className="p-2 border">TP</th>
                            <th className="p-2 border">Materi</th>
                            <th className="p-2 border">Indikator</th>
                            <th className="p-2 border">Bentuk</th>
                            <th className="p-2 border">Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kisiKisi.map((k) => (
                            <tr key={k.id}>
                              <td className="p-2 border text-center">{k.nomor}</td>
                              <td className="p-2 border">{k.tp}</td>
                              <td className="p-2 border">{k.materi}</td>
                              <td className="p-2 border">{k.indikator}</td>
                              <td className="p-2 border">{k.bentukSoal}</td>
                              <td className="p-2 border text-center">{k.levelKognitif}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {previewTab === 'kunci' && (
                  <div className="font-sans">
                    <h4 className="font-bold text-sm mb-3">Dokumen Kunci Jawaban & Bobot Skor</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {soalList.map((s) => (
                        <div key={s.id} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                          <span className="font-bold text-slate-700">No. {s.nomor}</span>
                          <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                            {s.kunciJawaban}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewTab === 'pembahasan' && (
                  <div className="font-sans space-y-3">
                    <h4 className="font-bold text-sm mb-2">Ulasan Pembahasan Pedagogis Madrasah</h4>
                    {soalList.map((s) => (
                      <div key={s.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl text-xs">
                        <div className="font-bold text-slate-900 mb-1">
                          Nomor {s.nomor} (Kunci: {s.kunciJawaban})
                        </div>
                        <p className="text-slate-600 leading-relaxed">{s.pembahasan}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation Controls */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-white transition disabled:opacity-30 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Langkah {step} dari 10 : <strong>{STEP_LABELS[step - 1]}</strong>
        </div>

        {step < 10 ? (
          <button
            type="button"
            onClick={() => setStep(Math.min(10, step + 1))}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinish}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Selesai & Ke Dashboard</span>
          </button>
        )}
      </div>
    </div>
  );
};
