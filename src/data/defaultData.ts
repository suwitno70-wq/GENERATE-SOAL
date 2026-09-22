import { 
  MadrasahProfile, 
  MapelInfo, 
  CPMaster, 
  TPMaster, 
  SoalItem, 
  NaskahSoalDocument,
  ActivityLog,
  AiSettings,
  KisiKisiDokumen
} from '../types';

export const DEFAULT_MADRASAH: MadrasahProfile = {
  id: 'MDR-001',
  namaMadrasah: 'MADRASAH IBTIDAIYAH NEGERI 1 CENDEKIA',
  nsm: '111132710001',
  npsn: '60721890',
  alamat: 'Jl. Madrasah No. 45, Kompleks Pendidikan Kemenag',
  desaKelurahan: 'Sukamaju',
  kecamatan: 'Cilodong',
  kabupaten: 'Kota Depok',
  provinsi: 'Jawa Barat',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Logo_Kementerian_Agama_Republik_Indonesia.png/240px-Logo_Kementerian_Agama_Republik_Indonesia.png',
  namaKepala: 'Drs. H. Ahmad Fauzi, M.Pd.I',
  nipKepala: '197508122002121003',
  akreditasi: 'A (Unggul)',
};

export const DAFTAR_MAPEL: MapelInfo[] = [
  { id: 'MP-01', nama: "Al-Qur'an Hadis", kode: 'QH', kategori: 'PAI' },
  { id: 'MP-02', nama: 'Akidah Akhlak', kode: 'AA', kategori: 'PAI' },
  { id: 'MP-03', nama: 'Fikih', kode: 'FIQ', kategori: 'PAI' },
  { id: 'MP-04', nama: 'Sejarah Kebudayaan Islam (SKI)', kode: 'SKI', kategori: 'PAI' },
  { id: 'MP-05', nama: 'Bahasa Arab', kode: 'BAR', kategori: 'PAI' },
  { id: 'MP-06', nama: 'Pendidikan Pancasila', kode: 'PPKN', kategori: 'Umum' },
  { id: 'MP-07', nama: 'Bahasa Indonesia', kode: 'BIND', kategori: 'Umum' },
  { id: 'MP-08', nama: 'Matematika', kode: 'MTK', kategori: 'Umum' },
  { id: 'MP-09', nama: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', kode: 'IPAS', kategori: 'Umum' },
  { id: 'MP-10', nama: 'Seni Budaya', kode: 'SBDP', kategori: 'Umum' },
  { id: 'MP-11', nama: 'PJOK', kode: 'PJOK', kategori: 'Umum' },
  { id: 'MP-12', nama: 'Bahasa Inggris', kode: 'BING', kategori: 'Umum' },
];

export const MASTER_CP: CPMaster[] = [
  {
    id: 'CP-FIQ-4',
    mapel: 'Fikih',
    fase: 'Fase B',
    kelas: ['3', '4'],
    elemen: 'Fikih Ibadah',
    cp: 'Peserta didik mampu memahami dan membiasakan ketentuan salat sunah, tanda-tanda balig, dan kebersihan diri (hadas dan najis) dalam kehidupan sehari-hari dengan benar sesuai syariat Islam.',
  },
  {
    id: 'CP-QH-4',
    mapel: "Al-Qur'an Hadis",
    fase: 'Fase B',
    kelas: ['3', '4'],
    elemen: "Al-Qur'an",
    cp: 'Peserta didik mampu membaca, menghafal, dan memahami makna surah-surah pendek (Surah At-Tin dan Al-Alaq) dengan hukum tajwid yang benar (mad thabi’i dan nun sukun).',
  },
  {
    id: 'CP-AA-4',
    mapel: 'Akidah Akhlak',
    fase: 'Fase B',
    kelas: ['3', '4'],
    elemen: 'Akidah & Akhlak Terpuji',
    cp: 'Peserta didik mampu memahami asmaul husna (Al-Malik, Al-Quddus, As-Salam) dan membiasakan akhlak terpuji seperti amanah, jujur, dan hormat kepada orang tua dan guru.',
  },
  {
    id: 'CP-IPAS-4',
    mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    fase: 'Fase B',
    kelas: ['3', '4'],
    elemen: 'Pemahaman IPAS (Sains dan Sosial)',
    cp: 'Peserta didik menganalisis hubungan antara bentuk serta fungsi bagian tubuh pada tumbuhan (akar, batang, daun, bunga, buah) serta proses fotosintesis secara sederhana.',
  },
  {
    id: 'CP-MTK-4',
    mapel: 'Matematika',
    fase: 'Fase B',
    kelas: ['3', '4'],
    elemen: 'Bilangan & Pengukuran',
    cp: 'Peserta didik menunjukkan pemahaman dan intuisi bilangan pada bilangan cacah sampai 10.000, melakukan operasi penjumlahan, pengurangan, serta menyelesaikan masalah pecahan senilai.',
  },
  {
    id: 'CP-BIND-4',
    mapel: 'Bahasa Indonesia',
    fase: 'Fase B',
    kelas: ['3', '4'],
    elemen: 'Membaca dan Memirsa',
    cp: 'Peserta didik mampu memahami ide pokok dan ide pendukung pada teks narasi dan eksposisi sederhana serta menemukan informasi tersurat dan tersirat.',
  },
];

export const MASTER_TP: TPMaster[] = [
  {
    id: 'TP-FIQ-01',
    cpId: 'CP-FIQ-4',
    mapel: 'Fikih',
    kelas: '4',
    materi: 'Tanda-tanda Balig Menurut Pandangan Ilmu Fikih dan Biologi',
    tp: 'Menjelaskan tanda-tanda balig bagi laki-laki dan perempuan menurut ilmu fikih dengan benar.',
  },
  {
    id: 'TP-FIQ-02',
    cpId: 'CP-FIQ-4',
    mapel: 'Fikih',
    kelas: '4',
    materi: 'Kewajiban Setelah Balig (Mukallaf)',
    tp: 'Mengidentifikasi konsekuensi dan kewajiban syariat bagi anak yang telah balig.',
  },
  {
    id: 'TP-IPAS-01',
    cpId: 'CP-IPAS-4',
    mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kelas: '4',
    materi: 'Bagian Tubuh Tumbuhan dan Fungsinya',
    tp: 'Mengidentifikasi bagian-bagian tubuh tumbuhan serta menghubungkan fungsi akar dan daun dalam proses fotosintesis.',
  },
  {
    id: 'TP-MTK-01',
    cpId: 'CP-MTK-4',
    mapel: 'Matematika',
    kelas: '4',
    materi: 'Pecahan Senilai dan Operasi Hitung',
    tp: 'Menentukan dan membuktikan dua pecahan senilai menggunakan gambar dan operasi perkalian/pembagian sederhana.',
  },
];

export const INITIAL_BANK_SOAL: SoalItem[] = [
  {
    id: 'SOAL-20260920-0001',
    nomor: 1,
    tp: 'Menjelaskan tanda-tanda balig bagi laki-laki dan perempuan menurut ilmu fikih dengan benar.',
    materi: 'Tanda-tanda Balig Menurut Fikih',
    indikator: 'Disajikan narasi perkembangan fisik, peserta didik dapat menentukan tanda balig bagi anak laki-laki menurut ilmu fikih.',
    levelKognitif: 'C2',
    kesulitan: 'Mudah',
    bentukSoal: 'Pilihan Ganda',
    stimulus: 'Faris berumur 12 tahun dan saat bangun tidur mengalami mimpi basah (ihtilam). Dalam pandangan fikih Islam, Faris telah memasuki masa baru.',
    pertanyaan: 'Berdasarkan peristiwa tersebut, tanda balig yang dialami Faris disebut...',
    pilihan: {
      A: 'Haid',
      B: 'Ihtilam (mimpi basah)',
      C: 'Tamyiz',
      D: 'Khitan',
    },
    kunciJawaban: 'B',
    pembahasan: 'Berdasarkan syariat fikih, salah satu tanda balig bagi anak laki-laki yang berusia minimal 9 tahun adalah mengalami mimpi basah (ihtilam).',
    skor: 1,
    statusValidasi: 'LAYAK',
    catatanValidasi: 'Bahasa pas untuk usia kelas 4 MI, materi relevan, kunci akurat.',
  },
  {
    id: 'SOAL-20260920-0002',
    nomor: 2,
    tp: 'Mengidentifikasi konsekuensi dan kewajiban syariat bagi anak yang telah balig.',
    materi: 'Kewajiban Setelah Balig (Mukallaf)',
    indikator: 'Disajikan beberapa pernyataan mengenai kewajiban ibadah, peserta didik dapat memilih kewajiban syar\'i bagi yang telah balig.',
    levelKognitif: 'C3',
    kesulitan: 'Sedang',
    bentukSoal: 'Pilihan Ganda Kompleks',
    stimulus: 'Seseorang yang telah memasuki usia balig disebut mukallaf. Perhatikan kewajiban-kewajiban berikut:\n(1) Salat fardu lima waktu\n(2) Puasa di bulan Ramadan\n(3) Menutup aurat\n(4) Berzakat jika sudah berpenghasilan',
    pertanyaan: 'Manakah kewajiban fardu ain yang langsung melekat pada setiap muslim ketika baru saja memasuki usia balig? (Pilih dua atau tiga jawaban benar)',
    pilihan: {
      A: 'Menjalankan salat lima waktu',
      B: 'Melaksanakan ibadah haji ke Makkah',
      C: 'Berpuasa penuh pada bulan Ramadan',
      D: 'Menutup aurat sesuai syariat Islam',
    },
    kunciPgKompleks: ['A', 'C', 'D'],
    kunciJawaban: 'A, C, D',
    pembahasan: 'Kewajiban fardu ain yang langsung wajib dilaksanakan setelah balig adalah salat 5 waktu, puasa Ramadan, dan menutup aurat. Haji hanya wajib jika telah mampu (istitha\'ah).',
    skor: 2,
    statusValidasi: 'LAYAK',
  },
  {
    id: 'SOAL-20260920-0003',
    nomor: 3,
    tp: 'Mengidentifikasi bagian-bagian tubuh tumbuhan serta menghubungkan fungsi akar dan daun.',
    materi: 'Bagian Tubuh Tumbuhan dan Fotosintesis',
    indikator: 'Disajikan ilustrasi fungsi organ daun pada tumbuhan, peserta didik dapat menjelaskan zat yang dibutuhkan untuk fotosintesis.',
    levelKognitif: 'C4',
    kesulitan: 'Sedang',
    bentukSoal: 'Isian Singkat',
    stimulus: 'Daun pada tumbuhan hijau memiliki zat hijau yang berfungsi menangkap sinar matahari dalam proses memasak makanan.',
    pertanyaan: 'Zat hijau pada daun yang berperan penting dalam proses fotosintesis disebut...',
    kunciJawaban: 'Klorofil',
    pembahasan: 'Klorofil adalah pigmen atau zat hijau daun yang berfungsi menyerap energi cahaya matahari untuk melangsungkan proses fotosintesis pada tumbuhan hijau.',
    skor: 2,
    statusValidasi: 'LAYAK',
  },
  {
    id: 'SOAL-20260920-0004',
    nomor: 4,
    tp: 'Menentukan dan membuktikan dua pecahan senilai.',
    materi: 'Pecahan Senilai',
    indikator: 'Disajikan masalah kontekstual pembagian kue, peserta didik dapat membuktikan pecahan senilai dalam bentuk uraian.',
    levelKognitif: 'C4',
    kesulitan: 'Sulit',
    bentukSoal: 'Uraian',
    stimulus: 'Aisyah memiliki satu loyang kue bolu dan memotongnya menjadi 4 bagian sama besar, lalu memakan 2 potong (2/4). Fatimah memiliki bolu yang sama besar, memotongnya menjadi 8 bagian sama besar, lalu memakan 4 potong (4/8).',
    pertanyaan: 'Apakah bagian kue yang dimakan Aisyah sama banyak dengan kue yang dimakan Fatimah? Tuliskan alasan dan pembuktian pecahan senilai tersebut secara matematis!',
    kunciJawaban: 'Ya, sama banyak. Pembuktian: 2/4 = (2:2)/(4:2) = 1/2. Sedangkan 4/8 = (4:4)/(8:4) = 1/2. Atau 2/4 dikali 2/2 = 4/8. Jadi 2/4 senilai dengan 4/8, masing-masing memakan setengah loyang.',
    pembahasan: 'Kedua pecahan 2/4 dan 4/8 adalah pecahan senilai yang sama-sama bernilai 1/2 bagian. Siswa membuktikan dengan cara menyederhanakan pecahan atau mengalikan pembilang dan penyebut dengan bilangan yang sama.',
    skor: 4,
    statusValidasi: 'LAYAK',
  },
];

export const INITIAL_SAMPLE_NASKAH: NaskahSoalDocument = {
  id: 'NASKAH-20260920-0001',
  identitas: {
    judul: 'ASESMEN SUMATIF LINGKUP MATERI (ASLM)',
    madrasah: 'MADRASAH IBTIDAIYAH NEGERI 1 CENDEKIA',
    tahunPelajaran: '2026/2027',
    semester: '1 (Ganjil)',
    kelas: '4',
    fase: 'Fase B',
    mapel: 'Fikih',
    guru: 'Ahmad Syukron, S.Pd.I',
    nipGuru: '198804152019031008',
    jenisAsesmen: 'Sumatif Lingkup Materi (UH)',
    alokasiWaktu: '60 Menit',
    kurikulum: 'Kurikulum Madrasah (KMA 1503)',
    paket: 'Paket A',
    tanggalPelaksanaan: '2026-09-22',
  },
  kisiKisi: [
    {
      id: 'KISI-001',
      nomor: 1,
      tp: 'Menjelaskan tanda-tanda balig bagi laki-laki dan perempuan menurut ilmu fikih dengan benar.',
      materi: 'Tanda-tanda Balig Menurut Fikih',
      indikator: 'Disajikan peristiwa mimpi basah, peserta didik dapat mengidentifikasi istilah fikihnya.',
      levelKognitif: 'C2',
      kesulitan: 'Mudah',
      bentukSoal: 'Pilihan Ganda',
      nomorSoal: 1,
      skorMaksimal: 1,
    },
    {
      id: 'KISI-002',
      nomor: 2,
      tp: 'Mengidentifikasi konsekuensi dan kewajiban syariat bagi anak yang telah balig.',
      materi: 'Kewajiban Setelah Balig (Mukallaf)',
      indikator: 'Disajikan pilihan kewajiban ibadah, peserta didik dapat menentukan kewajiban fardu ain setelah balig.',
      levelKognitif: 'C3',
      kesulitan: 'Sedang',
      bentukSoal: 'Pilihan Ganda Kompleks',
      nomorSoal: 2,
      skorMaksimal: 2,
    },
  ],
  daftarSoal: [
    INITIAL_BANK_SOAL[0],
    INITIAL_BANK_SOAL[1],
  ],
  petunjukUmum: [
    'Berdoalah kepada Allah SWT sebelum mulai mengerjakan soal.',
    'Tuliskan nama lengkap, kelas, dan nomor absen pada lembar jawaban yang tersedia.',
    'Bacalah setiap butir soal dengan cermat dan teliti sebelum menentukan jawaban.',
    'Dahulukan menjawab soal-soal yang kamu anggap paling mudah.',
    'Periksa kembali seluruh lembar jawabanmu sebelum diserahkan kepada Bapak/Ibu Guru.',
  ],
  createdAt: '2026-09-20 08:30',
  updatedAt: '2026-09-20 09:15',
  status: 'TERVALIDASI',
};

export const SAMPLE_BANK_SOAL: SoalItem[] = INITIAL_BANK_SOAL;
export const SAMPLE_NASKAH_DOKUMEN: NaskahSoalDocument[] = [INITIAL_SAMPLE_NASKAH];

export const SAMPLE_KISI_KISI_DOKUMEN: KisiKisiDokumen[] = [
  {
    id: 'KISI-DOC-001',
    judul: 'Kisi-Kisi Asesmen Sumatif Lingkup Materi Fikih Kelas 4',
    mapel: 'Fikih',
    kelas: '4',
    fase: 'Fase B',
    semester: '1 (Ganjil)',
    materiPokok: 'Tanda-tanda Balig Menurut Fikih',
    guru: 'Ahmad Syukron, S.Pd.I',
    items: INITIAL_SAMPLE_NASKAH.kisiKisi,
    updatedAt: '2026-09-20',
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'LOG-001',
    waktu: '2026-09-20 08:00',
    user: 'Ahmad Syukron (Guru)',
    aktivitas: 'Login Sistem',
    detail: 'Berhasil masuk ke aplikasi AI Generator Soal MI',
  },
  {
    id: 'LOG-002',
    waktu: '2026-09-20 08:15',
    user: 'Ahmad Syukron (Guru)',
    aktivitas: 'Generate Kisi-Kisi',
    detail: 'Membuat kisi-kisi Fikih Kelas 4 Bab Tanda Balig',
  },
  {
    id: 'LOG-003',
    waktu: '2026-09-20 08:30',
    user: 'Ahmad Syukron (Guru)',
    aktivitas: 'Validasi Soal AI',
    detail: 'Melakukan validasi otomatis untuk 2 butir soal - Hasil: 🟢 LAYAK',
  },
];

export const SAMPLE_LOGS: ActivityLog[] = INITIAL_LOGS;

export const DEFAULT_AI_SETTINGS: AiSettings = {
  apiProvider: 'Google Gemini (Server-side)',
  model: 'gemini-3.8-flash',
  temperature: 0.7,
  maxOutputTokens: 4096,
  enableHotsMode: true,
  strictAssessmentRules: true,
};

/**
 * Script Google Apps Script yang siap di-copy atau diexport
 * sesuai dengan struktur file di Section C & D Master Prompt.
 */
export const GAS_SCRIPTS = {
  'Code.gs': `/**
 * AI GENERATOR SOAL MADRASAH IBTIDAIYAH
 * Branding: AI GENERATOR SOAL MI - Kreatif by Witno
 * Backend Google Apps Script Web App
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('AI GENERATOR SOAL MI - Kreatif by Witno')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getInitialData() {
  var user = Auth.getCurrentUser();
  var madrasah = Database.getMadrasahProfile();
  var stats = Database.getDashboardStats();
  return {
    user: user,
    madrasah: madrasah,
    stats: stats
  };
}
`,
  'Config.gs': `/**
 * Config.gs - Konfigurasi Sistem dan PropertiesService
 */
var Config = {
  SPREADSHEET_ID: '', // Kosongkan jika ingin auto-create di Google Drive
  DEFAULT_MODEL: 'gemini-3.8-flash',
  
  getApiKey: function() {
    var props = PropertiesService.getScriptProperties();
    return props.getProperty('GEMINI_API_KEY') || '';
  },
  
  setApiKey: function(key) {
    PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key);
    return true;
  }
};
`,
  'Database.gs': `/**
 * Database.gs - Manajemen 15 Tabel Google Sheets Otomatis
 */
var Database = {
  SHEETS: [
    'USERS', 'MADRASAH', 'GURU', 'KELAS', 'MAPEL',
    'CP', 'TP', 'ATP', 'MATERI', 'KISI_KISI',
    'BANK_SOAL', 'NASKAH_SOAL', 'DETAIL_NASKAH', 'HASIL_VALIDASI', 'RIWAYAT_AI'
  ],

  initDatabase: function() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('DB_AI_GENERATOR_SOAL_MI');
    }
    
    // Inisialisasi Sheet USERS
    var shUsers = this.getOrCreateSheet(ss, 'USERS');
    if (shUsers.getLastRow() === 0) {
      shUsers.appendRow(['ID', 'Nama', 'Email', 'Password', 'Role', 'Status', 'CreatedAt', 'UpdatedAt']);
      shUsers.appendRow(['USR-001', 'Admin Madrasah', 'admin@madrasah.id', '123456', 'ADMIN', 'AKTIF', new Date(), new Date()]);
      shUsers.appendRow(['USR-002', 'Guru MI', 'guru@madrasah.id', '123456', 'GURU', 'AKTIF', new Date(), new Date()]);
      shUsers.appendRow(['USR-003', 'Kepala Madrasah', 'kamad@madrasah.id', '123456', 'KEPALA_MADRASAH', 'AKTIF', new Date(), new Date()]);
    }
    
    // Inisialisasi Sheet MADRASAH
    var shMadrasah = this.getOrCreateSheet(ss, 'MADRASAH');
    if (shMadrasah.getLastRow() === 0) {
      shMadrasah.appendRow(['ID', 'Nama Madrasah', 'NSM', 'NPSN', 'Alamat', 'Desa/Kel', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Logo', 'Kepala', 'NIP', 'CreatedAt', 'UpdatedAt']);
      shMadrasah.appendRow(['MDR-01', 'MI Negeri 1 Cendekia', '111132710001', '60721890', 'Jl. Kemenag No. 45', 'Sukamaju', 'Cilodong', 'Depok', 'Jawa Barat', '', 'Drs. H. Ahmad Fauzi, M.Pd.I', '197508122002121003', new Date(), new Date()]);
    }
    
    return { success: true, url: ss.getUrl() };
  },

  getOrCreateSheet: function(ss, sheetName) {
    var sh = ss.getSheetByName(sheetName);
    if (!sh) {
      sh = ss.insertSheet(sheetName);
    }
    return sh;
  },

  getDashboardStats: function() {
    return {
      totalNaskah: 12,
      totalSoal: 145,
      totalBankSoal: 180,
      totalKisiKisi: 12,
      soalValid: 138,
      soalPerluRevisi: 7
    };
  }
};
`,
  'AI.gs': `/**
 * AI.gs - Integrasi Gemini API
 * Keamanan: API key disimpan di PropertiesService, bukan di client!
 */
var AIService = {
  callGemini: function(prompt, systemInstruction) {
    var apiKey = Config.getApiKey();
    if (!apiKey) {
      throw new Error("API Key Gemini belum disetting di PropertiesService.");
    }
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + Config.DEFAULT_MODEL + ":generateContent?key=" + apiKey;
    var payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      }
    };
    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());
    if (json.candidates && json.candidates[0].content.parts[0].text) {
      return JSON.parse(json.candidates[0].content.parts[0].text);
    }
    throw new Error("Format respon AI tidak sesuai.");
  }
};
`,
  'appsscript.json': `{
  "timeZone": "Asia/Jakarta",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}`
};
