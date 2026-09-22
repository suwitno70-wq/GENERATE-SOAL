import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Download, RefreshCw } from 'lucide-react';
import { DAFTAR_MAPEL } from '../data/defaultData';
import { apiGenerateCepat, exportToWordDoc, generateUniqueId } from '../services/api';
import { MadrasahProfile, NaskahSoalDocument, SoalItem } from '../types';

interface QuickGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  madrasah: MadrasahProfile;
  onSendToBankSoal: (items: SoalItem[]) => void;
}

export const QuickGeneratorModal: React.FC<QuickGeneratorModalProps> = ({
  isOpen,
  onClose,
  madrasah,
  onSendToBankSoal,
}) => {
  const [mapel, setMapel] = useState("Akidah Akhlak");
  const [kelas, setKelas] = useState("4");
  const [materi, setMateri] = useState("Asmaul Husna Al-Malik dan Al-Quddus");
  const [jumlahSoal, setJumlahSoal] = useState(5);
  const [bentukSoal, setBentukSoal] = useState("Pilihan Ganda");
  const [kesulitan, setKesulitan] = useState("Campuran");
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSoal, setGeneratedSoal] = useState<SoalItem[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const data = await apiGenerateCepat({
        mapel,
        kelas,
        materi,
        jumlahSoal,
        bentukSoal,
        kesulitan,
      });

      if (data.soalList && Array.isArray(data.soalList)) {
        const items: SoalItem[] = data.soalList.map((s: any, idx: number) => ({
          ...s,
          id: generateUniqueId('SOAL'),
          nomor: idx + 1,
          statusValidasi: 'LAYAK',
        }));
        setGeneratedSoal(items);
        onSendToBankSoal(items);
      }
    } catch (err) {
      alert('Maaf, generate cepat belum berhasil. Silakan ulangi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDoc = () => {
    const doc: NaskahSoalDocument = {
      id: generateUniqueId('NASKAH'),
      identitas: {
        judul: 'LATIHAN SOAL INSTAN MI',
        madrasah: madrasah.namaMadrasah,
        tahunPelajaran: '2026/2027',
        semester: '1 (Ganjil)',
        kelas: kelas as any,
        fase: kelas === '1' || kelas === '2' ? 'Fase A' : kelas === '3' || kelas === '4' ? 'Fase B' : 'Fase C',
        mapel,
        guru: 'Guru Pengampu MI',
        jenisAsesmen: 'Latihan Harian',
        alokasiWaktu: '30 Menit',
        kurikulum: 'Kurikulum Merdeka',
        paket: 'Paket A',
      },
      kisiKisi: [],
      daftarSoal: generatedSoal,
      petunjukUmum: ['Bacalah doa sebelum mengerjakan.', 'Pilih jawaban yang paling tepat.'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'DRAFT',
    };
    exportToWordDoc(doc, madrasah, true, true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-400/40 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-950">
                ⚡ Buat Soal Cepat (1 Klik)
              </h3>
              <p className="text-[11px] text-amber-950/80">
                Hasilkan butir soal berkualitas seketika tanpa langkah panjang
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 text-emerald-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {generatedSoal.length === 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {DAFTAR_MAPEL.map((m) => (
                      <option key={m.id} value={m.nama}>{m.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenjang Kelas</label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="1">Kelas 1 MI</option>
                    <option value="2">Kelas 2 MI</option>
                    <option value="3">Kelas 3 MI</option>
                    <option value="4">Kelas 4 MI</option>
                    <option value="5">Kelas 5 MI</option>
                    <option value="6">Kelas 6 MI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topik / Materi Pokok</label>
                <input
                  type="text"
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  placeholder="mis. Rukun Iman, Shalat Berjamaah, dll."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah</label>
                  <select
                    value={jumlahSoal}
                    onChange={(e) => setJumlahSoal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-emerald-800"
                  >
                    <option value={3}>3 Butir</option>
                    <option value={5}>5 Butir</option>
                    <option value={10}>10 Butir</option>
                    <option value={15}>15 Butir</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bentuk</label>
                  <select
                    value={bentukSoal}
                    onChange={(e) => setBentukSoal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Isian Singkat">Isian Singkat</option>
                    <option value="Uraian">Uraian</option>
                    <option value="Campuran">Campuran</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kesulitan</label>
                  <select
                    value={kesulitan}
                    onChange={(e) => setKesulitan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Campuran">Campuran</option>
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit (HOTS)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                💡 <strong>Tips Cepat:</strong> Fitur ini cocok untuk kuis dadakan, ulangan harian kilat, lembar kerja siswa (LKS), atau latihan pendalaman materi di kelas.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                  Berhasil Membuat {generatedSoal.length} Butir Soal!
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Tersimpan di Bank Soal
                </span>
              </div>

              <div className="space-y-3">
                {generatedSoal.map((s) => (
                  <div key={s.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/60 text-xs">
                    <div className="font-bold text-slate-900 mb-1">
                      {s.nomor}. {s.pertanyaan}
                    </div>
                    {s.pilihan && (
                      <div className="grid grid-cols-2 gap-1 my-1 text-[11px] text-slate-700">
                        {Object.entries(s.pilihan).map(([k, v]) => (
                          <div key={k}>{k}. {v}</div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-[11px] font-semibold text-emerald-800">
                      Kunci: {s.kunciJawaban}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {generatedSoal.length === 0 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-submit-quick-generate"
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Menulis Butir Soal...' : '⚡ Hasilkan Sekarang'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setGeneratedSoal([])}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 border rounded-lg"
              >
                Buat Lagi
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDoc}
                  className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Word</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
