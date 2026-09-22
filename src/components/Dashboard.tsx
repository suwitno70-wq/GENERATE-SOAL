import React from 'react';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Database, 
  Image as ImageIcon,
  ArrowRight,
  Clock,
  Download,
  School,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { UserRole, ActivityLog, NaskahSoalDocument, SoalItem, MadrasahProfile } from '../types';

interface DashboardProps {
  stats: {
    totalNaskah: number;
    totalSoal: number;
    totalBankSoal: number;
    totalKisiKisi: number;
    soalValid: number;
    soalPerluRevisi: number;
  };
  hasSavedDraft: boolean;
  onResumeDraft: () => void;
  onDiscardDraft: () => void;
  onStartGenerator: () => void;
  onOpenQuickGen: () => void;
  onOpenImageGen: () => void;
  onNavigateTab: (tab: string) => void;
  recentNaskah: NaskahSoalDocument[];
  activityLogs: ActivityLog[];
  currentRole: UserRole;
  madrasah: MadrasahProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  hasSavedDraft,
  onResumeDraft,
  onDiscardDraft,
  onStartGenerator,
  onOpenQuickGen,
  onOpenImageGen,
  onNavigateTab,
  recentNaskah,
  activityLogs,
  currentRole,
  madrasah,
}) => {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Draft Recovery Banner */}
      {hasSavedDraft && (
        <div 
          id="draft-recovery-banner"
          className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Draft Pembuatan Soal Ditemukan!
              </h4>
              <p className="text-xs text-amber-700">
                Anda memiliki progres pembuatan soal yang belum tersimpan ke naskah resmi. Ingin melanjutkan sesi sebelumnya?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-discard-draft"
              onClick={onDiscardDraft}
              className="text-xs px-3 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg bg-white transition hover:bg-slate-50"
            >
              Mulai Baru
            </button>
            <button
              id="btn-resume-draft"
              onClick={onResumeDraft}
              className="text-xs px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1"
            >
              <span>Lanjutkan Sesi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3 border border-white/10">
            <School className="w-3.5 h-3.5" />
            <span>{madrasah.namaMadrasah}</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-snug">
            Asisten Cerdas Penulisan Naskah Soal & Evaluasi Madrasah Ibtidaiyah
          </h1>
          <p className="mt-2 text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Rancang asesmen berkualitas tinggi terintegrasi dari <strong>CP → TP → ATP → Kisi-Kisi → Soal → Validasi 12 Aspek → Bank Soal → Export Word/PDF</strong> berstandar Kemenag RI.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              id="btn-hero-wizard"
              onClick={onStartGenerator}
              className="px-4 py-2.5 bg-white text-emerald-900 font-bold rounded-xl shadow-md hover:bg-emerald-50 transition flex items-center gap-2 text-xs sm:text-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Buka Generator Soal (10 Step)</span>
            </button>
            <button
              id="btn-hero-quick"
              onClick={onOpenQuickGen}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl shadow-md transition flex items-center gap-2 text-xs sm:text-sm active:scale-95"
            >
              <span>⚡ Generate Cepat (1 Klik)</span>
            </button>
            <button
              id="btn-hero-image"
              onClick={onOpenImageGen}
              className="px-3 py-2.5 bg-emerald-900/60 hover:bg-emerald-900/90 text-emerald-100 font-semibold rounded-xl border border-emerald-500/40 transition flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <ImageIcon className="w-4 h-4 text-emerald-300" />
              <span>Soal Gambar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kepala Madrasah Exclusive Alert / Overview */}
      {currentRole === 'KEPALA_MADRASAH' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-blue-900">
          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Mode Pengawasan Kepala Madrasah:</span> Anda sedang melihat statistik ketercapaian naskah soal dan kualitas evaluasi seluruh dewan guru. Anda memiliki akses monitoring dan review validasi naskah.
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div 
          onClick={() => onNavigateTab('naskah')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Naskah</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.totalNaskah}</span>
            <span className="text-[11px] text-slate-400">paket</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('banksoal')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Soal</span>
            <HelpCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.totalSoal}</span>
            <span className="text-[11px] text-slate-400">butir</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('banksoal')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bank Soal</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.totalBankSoal}</span>
            <span className="text-[11px] text-slate-400">arsip</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('kisikisi')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kisi-Kisi</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.totalKisiKisi}</span>
            <span className="text-[11px] text-slate-400">matriks</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Soal Valid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.soalValid}</span>
            <span className="text-[11px] text-emerald-600">🟢 Layak</span>
          </div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Perlu Revisi</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{stats.soalPerluRevisi}</span>
            <span className="text-[11px] text-amber-600">🟡 Tinjau</span>
          </div>
        </div>
      </div>

      {/* Main Feature Cards (Alur Utama) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800">
            Alur Terintegrasi Pembuatan Soal MI
          </h2>
          <span className="text-xs text-slate-500">Lengkap & Mudah di HP</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={onStartGenerator}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group hover:border-emerald-500"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition text-sm sm:text-base">
              1. Generator Soal Bertahap
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Wizard 10 langkah dari CP/TP kurikulum, penyusunan indikator, matriks kisi-kisi, sampai naskah jadi siap cetak.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-700 gap-1">
              <span>Mulai Buat Soal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('banksoal')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group hover:border-emerald-500"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition">
              <Database className="w-5 h-5 text-purple-700" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-purple-700 transition text-sm sm:text-base">
              2. Bank Soal & Paket A/B/C/D
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Kelola koleksi soal, filter mapel/kelas/kognitif, dan rancang paket variasi ujian dengan pengacakan otomatis.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-purple-700 gap-1">
              <span>Buka Bank Soal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('naskah')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group hover:border-emerald-500"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition text-sm sm:text-base">
              3. Naskah, Kunci & Export Word/PDF
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Kop resmi Kemenag RI, petunjuk pengerjaan, kunci jawaban terpisah, ulasan pembahasan, dan 1-klik cetak/unduh.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-blue-700 gap-1">
              <span>Lihat Naskah Siap Cetak</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Naskah & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Naskah Terkini */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Naskah Soal Madrasah Terkini</span>
            </h3>
            <button 
              onClick={() => onNavigateTab('naskah')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Lihat Semua
            </button>
          </div>

          {recentNaskah.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              Belum ada naskah yang disimpan. Mulai buat naskah soal pertama Anda!
            </p>
          ) : (
            <div className="space-y-3">
              {recentNaskah.slice(0, 3).map((naskah) => (
                <div 
                  key={naskah.id}
                  onClick={() => onNavigateTab('naskah')}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/30 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {naskah.identitas.mapel} - Kelas {naskah.identitas.kelas}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                        {naskah.identitas.paket}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {naskah.identitas.jenisAsesmen} • {naskah.daftarSoal.length} Butir Soal • Guru: {naskah.identitas.guru}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[10px] bg-emerald-600 text-white font-medium px-2 py-0.5 rounded-full">
                      Siap Cetak
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Catatan Aktivitas Sistem (Log)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Real-time</span>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.aktivitas}</span>
                    <span className="text-[10px] text-slate-400">{log.waktu}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{log.detail}</p>
                  <span className="text-[10px] text-slate-400">Oleh: {log.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
