import React, { useState } from 'react';
import { BookOpen, Search, Download, Trash2, Edit3, Plus, Sparkles, Filter } from 'lucide-react';
import { KisiKisiDokumen, KisiKisiItem, MadrasahProfile } from '../types';
import { DAFTAR_MAPEL } from '../data/defaultData';
import { exportKisiKisiToCsv } from '../services/api';

interface KisiKisiViewProps {
  kisiKisiList: KisiKisiDokumen[];
  onStartGenerator: () => void;
  madrasah: MadrasahProfile;
  onDeleteKisiKisi: (id: string) => void;
}

export const KisiKisiView: React.FC<KisiKisiViewProps> = ({
  kisiKisiList,
  onStartGenerator,
  madrasah,
  onDeleteKisiKisi,
}) => {
  const [selectedMapel, setSelectedMapel] = useState<string>('Semua');
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeKisiId, setActiveKisiId] = useState<string | null>(
    kisiKisiList[0]?.id || null
  );

  const filteredDocs = kisiKisiList.filter((doc) => {
    const matchMapel = selectedMapel === 'Semua' || doc.mapel === selectedMapel;
    const matchKelas = selectedKelas === 'Semua' || doc.kelas === selectedKelas;
    const matchSearch = doc.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.materiPokok.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMapel && matchKelas && matchSearch;
  });

  const activeDoc = kisiKisiList.find((d) => d.id === activeKisiId) || filteredDocs[0];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span>Matriks Kisi-Kisi Asesmen MI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar rancangan kisi-kisi pemetaan TP, materi pokok, indikator, level kognitif, dan bentuk soal.
          </p>
        </div>

        <button
          onClick={onStartGenerator}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Buat Kisi-Kisi Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari materi atau judul kisi-kisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Semua">Semua Mata Pelajaran</option>
            {DAFTAR_MAPEL.map((m) => (
              <option key={m.id} value={m.nama}>{m.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Semua">Semua Jenjang Kelas</option>
            <option value="1">Kelas 1 MI</option>
            <option value="2">Kelas 2 MI</option>
            <option value="3">Kelas 3 MI</option>
            <option value="4">Kelas 4 MI</option>
            <option value="5">Kelas 5 MI</option>
            <option value="6">Kelas 6 MI</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Document list & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Document List */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">
            Daftar Dokumen ({filteredDocs.length})
          </h3>
          
          {filteredDocs.length === 0 ? (
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              Tidak ada kisi-kisi yang cocok.
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = doc.id === activeDoc?.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveKisiId(doc.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{doc.mapel}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Kelas {doc.kelas}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {doc.materiPokok}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{doc.items.length} Butir</span>
                    <span>{doc.updatedAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Area: Table & Actions */}
        <div className="lg:col-span-3">
          {activeDoc ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-md">
                      {activeDoc.mapel}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      Kelas {activeDoc.kelas} ({activeDoc.fase})
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-900 mt-1">
                    {activeDoc.judul}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Materi: {activeDoc.materiPokok} • Guru: {activeDoc.guru}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportKisiKisiToCsv(activeDoc.items, {
                      judul: activeDoc.judul,
                      madrasah: madrasah.namaMadrasah,
                      tahunPelajaran: '2026/2027',
                      semester: activeDoc.semester,
                      kelas: activeDoc.kelas as any,
                      fase: activeDoc.fase,
                      mapel: activeDoc.mapel,
                      guru: activeDoc.guru,
                      jenisAsesmen: 'Sumatif Lingkup Materi (UH)',
                      alokasiWaktu: '60 Menit',
                      kurikulum: 'Kurikulum Merdeka',
                      paket: 'Paket A'
                    })}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel</span>
                  </button>

                  <button
                    onClick={() => onDeleteKisiKisi(activeDoc.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Hapus Kisi-Kisi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-10">No</th>
                      <th className="p-2.5 min-w-[140px]">Tujuan Pembelajaran</th>
                      <th className="p-2.5 min-w-[120px]">Materi Pokok</th>
                      <th className="p-2.5 min-w-[200px]">Indikator Soal</th>
                      <th className="p-2.5 text-center w-16">Level</th>
                      <th className="p-2.5 text-center w-16">Kesulitan</th>
                      <th className="p-2.5 min-w-[110px]">Bentuk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeDoc.items.map((item: KisiKisiItem, idx: number) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/70">
                        <td className="p-2.5 text-center font-bold text-slate-600">{item.nomor}</td>
                        <td className="p-2.5 text-slate-800">{item.tp}</td>
                        <td className="p-2.5 text-slate-700 font-medium">{item.materi}</td>
                        <td className="p-2.5 text-slate-600 leading-relaxed text-[11px]">{item.indikator}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-800">{item.levelKognitif}</td>
                        <td className="p-2.5 text-center text-slate-600">{item.kesulitan}</td>
                        <td className="p-2.5">
                          <span className="inline-block text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                            {item.bentukSoal}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              Pilih dokumen kisi-kisi untuk melihat matriks lengkap.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
