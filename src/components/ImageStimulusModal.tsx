import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Check, Download, AlertCircle } from 'lucide-react';
import { DAFTAR_MAPEL } from '../data/defaultData';
import { apiGenerateFromImage, generateUniqueId } from '../services/api';
import { SoalItem } from '../types';

interface ImageStimulusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSoal: (soal: SoalItem) => void;
}

export const ImageStimulusModal: React.FC<ImageStimulusModalProps> = ({
  isOpen,
  onClose,
  onAddSoal,
}) => {
  const [mapel, setMapel] = useState("Fikih");
  const [kelas, setKelas] = useState("4");
  const [instruksi, setInstruksi] = useState("Buatlah 1 soal pilihan ganda HOTS dan 1 pertanyaan analisis berdasarkan gambar ini.");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [base64Data, setBase64Data] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64 = result.split(',')[1];
      setBase64Data(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!base64Data) {
      alert('Silakan unggah gambar terlebih dahulu.');
      return;
    }
    setIsLoading(true);
    try {
      const soal = await apiGenerateFromImage({
        imageBase64: base64Data,
        mimeType,
        mapel,
        kelas,
        instruksiTambahan: instruksi,
      });

      const fullItem: SoalItem = {
        ...soal,
        id: generateUniqueId('SOAL'),
        nomor: 1,
        statusValidasi: 'LAYAK',
      };
      setGeneratedResult(fullItem);
      onAddSoal(fullItem);
    } catch (err) {
      alert('Maaf, pembuatan soal dari gambar belum berhasil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-emerald-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-extrabold text-base">
                Buat Soal dari Gambar / Stimulus Visual
              </h3>
              <p className="text-[11px] text-emerald-200">
                Unggah foto bagan, peta, atau ilustrasi buku paket MI
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-700 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {/* File Upload Area */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Unggah Gambar Stimulus</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 transition"
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain border border-slate-200"
                  />
                  <p className="text-xs text-emerald-700 font-semibold">
                    Klik untuk mengganti gambar
                  </p>
                </div>
              ) : (
                <div className="py-6">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-xs sm:text-sm">
                    Klik atau seret gambar ke sini
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mendukung JPG, PNG, atau WebP (Foto buku materi, bagan fikih, infografis)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <label className="block font-semibold text-slate-700 mb-1">Instruksi Guru ke AI</label>
            <textarea
              rows={2}
              value={instruksi}
              onChange={(e) => setInstruksi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              placeholder="mis. Fokuskan pertanyaan pada rukun wudhu yang terlihat di gambar..."
            />
          </div>

          {generatedResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-emerald-900">
                Hasil Butir Soal Terbentuk:
              </div>
              <p className="font-medium text-slate-800">{generatedResult.pertanyaan}</p>
              {generatedResult.pilihan && (
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {Object.entries(generatedResult.pilihan).map(([k, v]) => (
                    <div key={k}>{k}. {v as string}</div>
                  ))}
                </div>
              )}
              <div className="font-semibold text-emerald-800">
                Kunci Jawaban: {generatedResult.kunciJawaban}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !base64Data}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Menganalisis Gambar...' : 'Generate Soal Gambar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
