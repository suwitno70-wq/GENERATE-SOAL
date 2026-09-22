export type UserRole = 'ADMIN' | 'GURU' | 'KEPALA_MADRASAH';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  status: 'AKTIF' | 'NONAKTIF';
  createdAt: string;
}

export interface MadrasahProfile {
  id: string;
  namaMadrasah: string;
  nsm: string;
  npsn: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  logoUrl: string;
  namaKepala: string;
  nipKepala: string;
  akreditasi: string;
}

export type JenjangKelas = '1' | '2' | '3' | '4' | '5' | '6';
export type Fase = 'Fase A' | 'Fase B' | 'Fase C';

export interface MapelInfo {
  id: string;
  nama: string;
  kode: string;
  kategori: 'PAI' | 'Umum' | 'Muatan Lokal';
}

export interface CPMaster {
  id: string;
  mapel: string;
  fase: Fase;
  kelas: JenjangKelas[];
  elemen: string;
  cp: string;
}

export interface TPMaster {
  id: string;
  cpId: string;
  mapel: string;
  kelas: JenjangKelas;
  materi: string;
  tp: string;
}

export interface ATPMaster {
  id: string;
  tpId: string;
  urutan: number;
  atp: string;
  materi: string;
}

export type BentukSoal = 
  | 'Pilihan Ganda'
  | 'Pilihan Ganda Kompleks'
  | 'Benar/Salah'
  | 'Menjodohkan'
  | 'Isian Singkat'
  | 'Isian'
  | 'Uraian'
  | 'Essay'
  | 'Studi Kasus'
  | 'Literasi'
  | 'Numerasi'
  | 'Soal Berbasis Gambar';

export type LevelKognitif = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';
export type TingkatKesulitan = 'Mudah' | 'Sedang' | 'Sulit';
export type StatusValidasi = 'LAYAK' | 'PERLU_REVISI' | 'TIDAK_LAYAK' | 'BELUM_VALIDASI';

export interface KisiKisiItem {
  id: string;
  nomor: number;
  tp: string;
  materi: string;
  indikator: string;
  levelKognitif: LevelKognitif;
  kesulitan: TingkatKesulitan;
  bentukSoal: BentukSoal;
  nomorSoal: number;
  skorMaksimal: number;
}

export interface SoalPilihan {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  E?: string;
  [key: string]: string | undefined;
}

export interface MenjodohkanPair {
  kiri: string;
  kanan: string;
}

export interface SoalItem {
  id: string;
  nomor: number;
  kisiKisiId?: string;
  tp: string;
  materi: string;
  indikator: string;
  levelKognitif: LevelKognitif;
  kesulitan: TingkatKesulitan;
  bentukSoal: BentukSoal;
  stimulus?: string;
  gambarUrl?: string;
  pertanyaan: string;
  pilihan?: SoalPilihan;
  // Untuk PG Kompleks: array pilihan benar misal ['A', 'C']
  kunciPgKompleks?: string[];
  // Untuk Menjodohkan
  pasanganMenjodohkan?: MenjodohkanPair[];
  // Kunci utama (teks atau huruf)
  kunciJawaban: string;
  pembahasan: string;
  skor: number;
  statusValidasi: StatusValidasi;
  catatanValidasi?: string;
}

export interface ValidasiDetail {
  kesesuaianMateri: boolean;
  kesesuaianTP: boolean;
  kesesuaianIndikator: boolean;
  bahasaSesuaiUsiaMI: boolean;
  levelKognitifTepat: boolean;
  tingkatKesulitanSesuai: boolean;
  tidakAmbigu: boolean;
  kunciJawabanBenar: boolean;
  distraktorMasukAkal: boolean;
  tidakAdaDuplikasi: boolean;
  faktaValid: boolean;
  skorKelayakan: number; // 0 - 100
  status: StatusValidasi;
  alasan: string;
  saranPerbaikan: string;
}

export type JenisAsesmen = 
  | 'Latihan Harian'
  | 'Penilaian Formatif'
  | 'Sumatif Lingkup Materi (UH)'
  | 'Penilaian Tengah Semester (PTS/STS)'
  | 'Penilaian Akhir Semester (PAS/SAS)'
  | 'Asesmen Madrasah (AM)'
  | 'Remedial'
  | 'Pengayaan'
  | 'Try Out';

export interface NaskahIdentitas {
  judul: string;
  madrasah: string;
  tahunPelajaran: string;
  semester: '1 (Ganjil)' | '2 (Genap)';
  kelas: JenjangKelas;
  fase: Fase;
  mapel: string;
  guru: string;
  nipGuru?: string;
  jenisAsesmen: JenisAsesmen;
  alokasiWaktu: string;
  kurikulum: 'Kurikulum Madrasah (KMA 1503)' | 'Kurikulum Merdeka' | 'Kurikulum Madrasah (KMA 347/450)' | 'Custom';
  paket: 'Paket A' | 'Paket B' | 'Paket C' | 'Paket D';
  tanggalPelaksanaan?: string;
}

export interface KisiKisiDokumen {
  id: string;
  judul: string;
  mapel: string;
  kelas: JenjangKelas;
  fase: Fase;
  semester: '1 (Ganjil)' | '2 (Genap)';
  materiPokok: string;
  guru: string;
  items: KisiKisiItem[];
  updatedAt: string;
}

export interface KomposisiBentuk {
  bentuk: BentukSoal;
  jumlah: number;
  bobotPerSoal: number;
}

export interface NaskahSoalDocument {
  id: string;
  identitas: NaskahIdentitas;
  kisiKisi: KisiKisiItem[];
  daftarSoal: SoalItem[];
  petunjukUmum: string[];
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'SELESAI' | 'TERVALIDASI';
}

export interface ActivityLog {
  id: string;
  waktu: string;
  user: string;
  aktivitas: string;
  detail: string;
}

export interface AiSettings {
  apiProvider: 'Google Gemini (Server-side)';
  model: string;
  temperature: number;
  maxOutputTokens: number;
  enableHotsMode: boolean;
  strictAssessmentRules: boolean;
}

export interface GeneratorWizardState {
  currentStep: number;
  identitas: NaskahIdentitas;
  cp: string;
  tp: string;
  atp: string;
  materiPokok: string;
  submateri: string;
  stimulusTeks?: string;
  stimulusGambarUrl?: string;
  komposisi: Record<string, number>;
  distribusiKognitif: {
    mode: 'otomatis' | 'manual';
    persen: Record<LevelKognitif, number>;
  };
  distribusiKesulitan: {
    mode: 'otomatis' | 'manual';
    mudah: number;
    sedang: number;
    sulit: number;
  };
  kisiKisi: KisiKisiItem[];
  soalList: SoalItem[];
  validasiHasil: Record<string, ValidasiDetail>;
  isGeneratingKisiKisi: boolean;
  isGeneratingSoal: boolean;
  isValidating: boolean;
}
