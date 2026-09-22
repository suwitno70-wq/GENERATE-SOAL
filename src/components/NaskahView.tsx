import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Eye, 
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { NaskahSoalDocument, MadrasahProfile } from '../types';
import { exportToWordDoc, exportKisiKisiToCsv } from '../services/api';

interface NaskahViewProps {
  naskahList: NaskahSoalDocument[];
  madrasah: MadrasahProfile;
  onDeleteNaskah: (id: string) => void;
  onStartGenerator: () => void;
}

export const NaskahView: React.FC<NaskahViewProps> = ({
  naskahList,
  madrasah,
  onDeleteNaskah,
  onStartGenerator,
}) => {
  const [selectedNaskahId, setSelectedNaskahId] = useState<string | null>(
    naskahList[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<'soal' | 'kisikisi' | 'kunci' | 'pembahasan'>('soal');

  const selectedNaskah = naskahList.find((n) => n.id === selectedNaskahId) || naskahList[0];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>Dokumen Naskah Soal & Evaluasi MI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Naskah resmi siap cetak, dilengkapi Kop Madrasah, petunjuk pengerjaan, kunci jawaban, dan pembahasan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedNaskah && (
            <>
              <button
                id="btn-print-active-naskah"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF</span>
              </button>
              <button
                id="btn-word-active-naskah"
                onClick={() => exportToWordDoc(selectedNaskah, madrasah, true, true)}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Word (.doc)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Naskah List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              Daftar Naskah ({naskahList.length})
            </h3>
            <button
              onClick={onStartGenerator}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold"
            >
              + Buat Baru
            </button>
          </div>

          {naskahList.length === 0 ? (
            <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Belum ada naskah tersimpan.
            </div>
          ) : (
            naskahList.map((naskah) => {
              const isSelected = naskah.id === selectedNaskah?.id;
              return (
                <div
                  key={naskah.id}
                  onClick={() => setSelectedNaskahId(naskah.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{naskah.identitas.mapel}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      {naskah.identitas.paket}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kelas {naskah.identitas.kelas} • {naskah.daftarSoal.length} Butir Soal
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{naskah.identitas.jenisAsesmen}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Hapus naskah ini?')) onDeleteNaskah(naskah.id);
                      }}
                      className="text-red-400 hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Document Display Area */}
        <div className="lg:col-span-3">
          {selectedNaskah ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Tab Selector */}
              <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
                {(['soal', 'kisikisi', 'kunci', 'pembahasan'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize whitespace-nowrap ${
                      activeTab === t
                        ? 'bg-white text-emerald-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t === 'kisikisi' ? 'Kisi-Kisi Soal' : t === 'soal' ? 'Naskah Soal' : t === 'kunci' ? 'Kunci Jawaban' : 'Ulasan Pembahasan'}
                  </button>
                ))}
              </div>

              {/* Printable Document Box */}
              <div className="p-6 sm:p-8 min-h-[500px] text-slate-900 font-sans print:p-0">
                {/* Official Kemenag Kop */}
                <div className="border-b-4 border-double border-black pb-3 mb-4 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={madrasah.logoUrl}
                      alt="Logo Kemenag"
                      className="w-14 h-14 object-contain"
                    />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h4>
                      <h3 className="font-bold text-xs sm:text-sm uppercase">KANTOR KEMENTERIAN AGAMA {madrasah.kabupaten.toUpperCase()}</h3>
                      <h2 className="font-black text-sm sm:text-base text-emerald-900 uppercase">{madrasah.namaMadrasah.toUpperCase()}</h2>
                      <p className="text-[10px] text-slate-600 italic">NSM: {madrasah.nsm} | NPSN: {madrasah.npsn} | Akreditasi: {madrasah.akreditasi}</p>
                      <p className="text-[10px] text-slate-600">{madrasah.alamat}, {madrasah.kecamatan}, {madrasah.kabupaten}</p>
                    </div>
                  </div>
                </div>

                {/* Judul Naskah */}
                <div className="text-center font-bold text-sm sm:text-base underline mb-3 uppercase">
                  {selectedNaskah.identitas.judul} ({selectedNaskah.identitas.paket})
                </div>

                {/* Identitas Soal Table */}
                <table className="w-full text-xs mb-4 border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-28 py-0.5 font-semibold">Mata Pelajaran</td>
                      <td className="w-3">:</td>
                      <td className="font-bold">{selectedNaskah.identitas.mapel}</td>
                      <td className="w-24 py-0.5 font-semibold">Hari / Tanggal</td>
                      <td className="w-3">:</td>
                      <td>{selectedNaskah.identitas.tanggalPelaksanaan || '_________________'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-semibold">Kelas / Fase</td>
                      <td>:</td>
                      <td>Kelas {selectedNaskah.identitas.kelas} ({selectedNaskah.identitas.fase})</td>
                      <td className="py-0.5 font-semibold">Alokasi Waktu</td>
                      <td>:</td>
                      <td>{selectedNaskah.identitas.alokasiWaktu}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-semibold">Semester</td>
                      <td>:</td>
                      <td>{selectedNaskah.identitas.semester}</td>
                      <td className="py-0.5 font-semibold">Paket</td>
                      <td>:</td>
                      <td className="font-bold text-emerald-800">{selectedNaskah.identitas.paket}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Petunjuk Umum Box */}
                {activeTab === 'soal' && selectedNaskah.petunjukUmum && (
                  <div className="p-3 border border-slate-300 rounded-lg text-[11px] mb-4 bg-slate-50/50">
                    <span className="font-bold">PETUNJUK PENGERJAAN:</span>
                    <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-700">
                      {selectedNaskah.petunjukUmum.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* TAB 1: SOAL */}
                {activeTab === 'soal' && (
                  <div className="space-y-4">
                    <div className="font-bold text-xs uppercase border-b border-slate-200 pb-1">
                      I. BUTIR-BUTIR SOAL
                    </div>

                    <div className="space-y-4">
                      {selectedNaskah.daftarSoal.map((soal) => (
                        <div key={soal.id} className="text-xs space-y-1 page-break-inside-avoid">
                          <div className="flex items-start gap-2">
                            <span className="font-bold w-5">{soal.nomor}.</span>
                            <div className="flex-1">
                              {soal.stimulus && (
                                <div className="p-2.5 bg-slate-50 border-l-2 border-emerald-700 rounded text-slate-700 italic mb-1.5 leading-relaxed">
                                  {soal.stimulus}
                                </div>
                              )}
                              <p className="font-medium text-slate-900 leading-relaxed">
                                {soal.pertanyaan}
                              </p>

                              {soal.pilihan && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 ml-1 text-slate-800">
                                  {Object.entries(soal.pilihan).map(([huruf, teks]) => (
                                    <div key={huruf} className="flex items-baseline gap-1.5">
                                      <span className="font-bold">{huruf}.</span>
                                      <span>{teks}</span>
                                    </div>
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

                {/* TAB 2: KISI-KISI */}
                {activeTab === 'kisikisi' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase">Matriks Pemetaan Kisi-Kisi</h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="p-2 border">No</th>
                            <th className="p-2 border">TP</th>
                            <th className="p-2 border">Materi</th>
                            <th className="p-2 border">Indikator</th>
                            <th className="p-2 border text-center">Bentuk</th>
                            <th className="p-2 border text-center">Kognitif</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedNaskah.kisiKisi.map((k) => (
                            <tr key={k.id}>
                              <td className="p-2 border text-center">{k.nomor}</td>
                              <td className="p-2 border">{k.tp}</td>
                              <td className="p-2 border">{k.materi}</td>
                              <td className="p-2 border">{k.indikator}</td>
                              <td className="p-2 border text-center">{k.bentukSoal}</td>
                              <td className="p-2 border text-center font-bold text-emerald-800">{k.levelKognitif}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: KUNCI JAWABAN */}
                {activeTab === 'kunci' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase">Kunci Jawaban & Panduan Penilaian</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedNaskah.daftarSoal.map((s) => (
                        <div key={s.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Nomor {s.nomor}</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {s.kunciJawaban}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: PEMBAHASAN */}
                {activeTab === 'pembahasan' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-xs uppercase">Pembahasan Pedagogis Butir Soal</h4>
                    {selectedNaskah.daftarSoal.map((s) => (
                      <div key={s.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1">
                        <div className="font-bold text-slate-900">
                          Butir No. {s.nomor} (Kunci: {s.kunciJawaban})
                        </div>
                        <p className="text-slate-600 leading-relaxed">{s.pembahasan}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tanda Tangan Resmi Footer */}
                <div className="mt-12 grid grid-cols-2 text-center text-xs page-break-inside-avoid">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Madrasah</p>
                    <div className="h-16" />
                    <p className="font-bold underline">{madrasah.namaKepala}</p>
                    <p>NIP. {madrasah.nipKepala}</p>
                  </div>

                  <div>
                    <p>{madrasah.kabupaten.replace(/Kota |Kabupaten /i, '')}, {selectedNaskah.identitas.tanggalPelaksanaan || '...'}</p>
                    <p className="font-bold">Guru Pengampu Mata Pelajaran</p>
                    <div className="h-16" />
                    <p className="font-bold underline">{selectedNaskah.identitas.guru}</p>
                    <p>NIP. {selectedNaskah.identitas.nipGuru || '_______________________'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              Pilih dokumen naskah untuk melihat isi lengkap.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
