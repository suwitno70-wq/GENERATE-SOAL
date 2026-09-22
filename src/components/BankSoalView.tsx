import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Shuffle,
  FileText,
  Layers,
  Check
} from 'lucide-react';
import { SoalItem, BentukSoal, LevelKognitif, TingkatKesulitan, NaskahSoalDocument, MadrasahProfile } from '../types';
import { DAFTAR_MAPEL } from '../data/defaultData';
import { generateUniqueId } from '../services/api';

interface BankSoalViewProps {
  bankSoal: SoalItem[];
  onUpdateBankSoal: (items: SoalItem[]) => void;
  onMakeNaskahFromSelected: (selectedItems: SoalItem[], paketName: string) => void;
  madrasah: MadrasahProfile;
}

export const BankSoalView: React.FC<BankSoalViewProps> = ({
  bankSoal,
  onUpdateBankSoal,
  onMakeNaskahFromSelected,
  madrasah,
}) => {
  const [search, setSearch] = useState('');
  const [filterMapel, setFilterMapel] = useState('Semua');
  const [filterBentuk, setFilterBentuk] = useState('Semua');
  const [filterLevel, setFilterLevel] = useState('Semua');
  const [filterKesulitan, setFilterKesulitan] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Multi-selection for Paket Maker
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailModalSoal, setDetailModalSoal] = useState<SoalItem | null>(null);
  const [isPaketModalOpen, setIsPaketModalOpen] = useState(false);
  const [targetPaket, setTargetPaket] = useState<'Paket A' | 'Paket B' | 'Paket C' | 'Paket D'>('Paket B');
  const [randomizeOrder, setRandomizeOrder] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);

  // Filtered Items
  const filteredSoal = bankSoal.filter((s) => {
    const matchSearch = (s.pertanyaan || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.materi || '').toLowerCase().includes(search.toLowerCase());
    const matchBentuk = filterBentuk === 'Semua' || s.bentukSoal === filterBentuk;
    const matchLevel = filterLevel === 'Semua' || s.levelKognitif === filterLevel;
    const matchKesulitan = filterKesulitan === 'Semua' || s.kesulitan === filterKesulitan;
    const matchStatus = filterStatus === 'Semua' || s.statusValidasi === filterStatus;
    return matchSearch && matchBentuk && matchLevel && matchKesulitan && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredSoal.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSoal.map((s) => s.id));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus butir soal ini dari Bank Soal?')) {
      onUpdateBankSoal(bankSoal.filter((s) => s.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleDuplicate = (item: SoalItem) => {
    const duplicated: SoalItem = {
      ...item,
      id: generateUniqueId('SOAL'),
      nomor: bankSoal.length + 1,
      pertanyaan: `[Salinan] ${item.pertanyaan}`,
    };
    onUpdateBankSoal([duplicated, ...bankSoal]);
  };

  // Generate Paket Variasi (Pengacakan Soal & Opsi Jawaban)
  const handleGeneratePaket = () => {
    const chosen = bankSoal.filter((s) => selectedIds.includes(s.id));
    if (chosen.length === 0) {
      alert('Pilih minimal 1 butir soal untuk membuat paket ujian.');
      return;
    }

    let resultItems = [...chosen];

    // Acak urutan butir nomor
    if (randomizeOrder) {
      resultItems = resultItems.sort(() => Math.random() - 0.5);
    }

    // Acak posisi pilihan jawaban jika pilihan ganda
    if (randomizeOptions) {
      resultItems = resultItems.map((s) => {
        if (!s.pilihan) return s;
        const keys = Object.keys(s.pilihan);
        const correctText = s.pilihan[s.kunciJawaban || 'A'] || '';
        const valuesList = Object.values(s.pilihan).filter((v): v is string => typeof v === 'string');
        const shuffledValues = [...valuesList].sort(() => Math.random() - 0.5);
        
        const newPilihan: Record<string, string> = {};
        let newKunci = s.kunciJawaban;

        keys.forEach((k, idx) => {
          newPilihan[k] = shuffledValues[idx] || '';
          if (shuffledValues[idx] === correctText) {
            newKunci = k;
          }
        });

        return {
          ...s,
          pilihan: newPilihan,
          kunciJawaban: newKunci,
        };
      });
    }

    // Beri nomor urut baru 1..N
    const finalItems = resultItems.map((s, idx) => ({
      ...s,
      nomor: idx + 1,
    }));

    onMakeNaskahFromSelected(finalItems, targetPaket);
    setIsPaketModalOpen(false);
    alert(`Berhasil merancang naskah untuk ${targetPaket} dengan ${finalItems.length} butir soal!`);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-700" />
            <span>Bank Soal Madrasah Ibtidaiyah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Arsip soal terstandar Kemenag RI, siap dirancang menjadi Paket A, B, C, atau D.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsPaketModalOpen(true)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              <span>Rancang Paket ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari pertanyaan, materi, atau kata kunci..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={selectAll}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold whitespace-nowrap"
          >
            {selectedIds.length === filteredSoal.length && filteredSoal.length > 0 ? 'Batal Pilih Semua' : `Pilih Semua (${filteredSoal.length})`}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <select
              value={filterBentuk}
              onChange={(e) => setFilterBentuk(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Semua">Semua Bentuk</option>
              <option value="Pilihan Ganda">Pilihan Ganda</option>
              <option value="Pilihan Ganda Kompleks">PG Kompleks</option>
              <option value="Benar/Salah">Benar/Salah</option>
              <option value="Menjodohkan">Menjodohkan</option>
              <option value="Isian Singkat">Isian Singkat</option>
              <option value="Uraian">Uraian</option>
            </select>
          </div>

          <div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Semua">Semua Level</option>
              <option value="C1">C1 - Mengingat</option>
              <option value="C2">C2 - Memahami</option>
              <option value="C3">C3 - Menerapkan</option>
              <option value="C4">C4 - Menganalisis (HOTS)</option>
              <option value="C5">C5 - Mengevaluasi (HOTS)</option>
              <option value="C6">C6 - Berkreasi (HOTS)</option>
            </select>
          </div>

          <div>
            <select
              value={filterKesulitan}
              onChange={(e) => setFilterKesulitan(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Semua">Semua Kesulitan</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sulit">Sulit</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Semua">Semua Status</option>
              <option value="LAYAK">🟢 Layak</option>
              <option value="PERLU_REVISI">🟡 Perlu Revisi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Soal List Grid */}
      <div className="space-y-3">
        {filteredSoal.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <Database className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600 text-sm">Tidak ada soal yang sesuai dengan filter.</p>
          </div>
        ) : (
          filteredSoal.map((soal) => {
            const isSelected = selectedIds.includes(soal.id);
            return (
              <div
                key={soal.id}
                className={`p-4 rounded-2xl border transition bg-white ${
                  isSelected ? 'border-purple-600 ring-2 ring-purple-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(soal.id)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {soal.id}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {soal.bentukSoal}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {soal.levelKognitif} • {soal.kesulitan} • Skor: {soal.skor}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setDetailModalSoal(soal)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(soal)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                      title="Duplikasi"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(soal.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs sm:text-sm text-slate-800 font-medium">
                  {soal.stimulus && (
                    <p className="text-slate-500 italic bg-slate-50 p-2 rounded mb-1 text-xs">
                      {soal.stimulus}
                    </p>
                  )}
                  <p>{soal.pertanyaan}</p>
                </div>

                {soal.pilihan && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600 ml-2">
                    {Object.entries(soal.pilihan).map(([k, v]) => (
                      <div key={k} className={soal.kunciJawaban?.includes(k) ? 'font-bold text-emerald-700' : ''}>
                        {k}. {v} {soal.kunciJawaban?.includes(k) && '✓'}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Materi: <strong>{soal.materi}</strong></span>
                  <span className="font-bold text-emerald-800">
                    Kunci: {soal.kunciJawaban}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Paket Maker (Paket A/B/C/D) */}
      {isPaketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900 mb-1 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-purple-700" />
              <span>Rancang Paket Soal Baru</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilihan {selectedIds.length} butir soal akan diacak dan disusun menjadi naskah variasi baru.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Paket</label>
                <select
                  value={targetPaket}
                  onChange={(e) => setTargetPaket(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-purple-900"
                >
                  <option value="Paket A">Paket A</option>
                  <option value="Paket B">Paket B</option>
                  <option value="Paket C">Paket C</option>
                  <option value="Paket D">Paket D</option>
                </select>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={randomizeOrder}
                    onChange={(e) => setRandomizeOrder(e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span>Acak urutan nomor butir soal</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={randomizeOptions}
                    onChange={(e) => setRandomizeOptions(e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span>Acak letak pilihan jawaban (A/B/C/D) & sinkronkan kunci</span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPaketModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleGeneratePaket}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow"
              >
                Buat {targetPaket}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Soal */}
      {detailModalSoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h4 className="font-bold text-sm text-slate-900">Detail Butir Soal ({detailModalSoal.id})</h4>
              <button onClick={() => setDetailModalSoal(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div><strong>Tujuan Pembelajaran:</strong> {detailModalSoal.tp}</div>
              <div><strong>Materi:</strong> {detailModalSoal.materi}</div>
              <div><strong>Indikator:</strong> {detailModalSoal.indikator}</div>
              <div className="p-2 bg-slate-50 rounded border text-slate-800">
                {detailModalSoal.pertanyaan}
              </div>
              <div><strong>Kunci:</strong> <span className="text-emerald-700 font-bold">{detailModalSoal.kunciJawaban}</span></div>
              {detailModalSoal.pembahasan && (
                <div><strong>Pembahasan:</strong> <p className="text-slate-600 mt-1">{detailModalSoal.pembahasan}</p></div>
              )}
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setDetailModalSoal(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
