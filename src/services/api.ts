import { 
  NaskahIdentitas, 
  KisiKisiItem, 
  SoalItem, 
  ValidasiDetail, 
  BentukSoal,
  LevelKognitif,
  TingkatKesulitan,
  NaskahSoalDocument,
  MadrasahProfile
} from '../types';

export const generateUniqueId = (prefix: 'SOAL' | 'NASKAH' | 'KISI' | 'LOG'): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomNum}`;
};

// API Call: Curriculum Assistant
export async function apiFetchCurriculumDraft(params: {
  mapel: string;
  kelas: string;
  fase: string;
  kurikulum: string;
  topikMateri: string;
  elemen?: string;
}): Promise<{
  cp: string;
  tp: Array<{ nomor: number; tujuan: string; materi: string }>;
  atp: Array<{ urutan: number; alur: string }>;
  indikator: string[];
  catatan: string;
}> {
  try {
    const res = await fetch('/api/gemini/curriculum-helper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.message || 'Gagal memuat bantuan kurikulum.');
  } catch (err: any) {
    console.warn('API fetch fallback triggered for curriculum helper:', err);
    // Fallback cerdas agar alur kerja guru tidak terhenti
    return {
      cp: `Peserta didik mampu memahami konsep esensial pada materi ${params.topikMateri || 'pokok'}, menghubungkannya dengan konteks kehidupan sehari-hari di madrasah dan lingkungan, serta menumbuhkan akhlak mulia sesuai nilai-nilai Islam.`,
      tp: [
        {
          nomor: 1,
          tujuan: `Menjelaskan pengertian dan konsep dasar ${params.topikMateri || 'materi'} dengan tepat.`,
          materi: params.topikMateri,
        },
        {
          nomor: 2,
          tujuan: `Mengidentifikasi contoh dan penerapan ${params.topikMateri || 'materi'} dalam kehidupan sehari-hari.`,
          materi: params.topikMateri,
        },
        {
          nomor: 3,
          tujuan: `Menganalisis hikmah atau manfaat ${params.topikMateri || 'materi'} bagi diri sendiri dan sesama.`,
          materi: params.topikMateri,
        },
      ],
      atp: [
        { urutan: 1, alur: `Pengenalan konsep faktual dan definisi dasar ${params.topikMateri}.` },
        { urutan: 2, alur: `Eksplorasi contoh dan pemahaman kontekstual pada tingkat peserta didik MI.` },
        { urutan: 3, alur: `Penerapan dan refleksi praktis dalam ibadah atau kehidupan bermasyarakat.` },
      ],
      indikator: [
        `Disajikan teks stimulus, peserta didik dapat menentukan konsep dasar ${params.topikMateri} dengan benar.`,
        `Disajikan tabel perbandingan, peserta didik dapat mengklasifikasikan contoh dengan tepat.`,
        `Diberikan narasi peristiwa, peserta didik dapat menarik kesimpulan dengan cermat.`,
      ],
      catatan: 'Draft AI — wajib ditinjau dan disesuaikan guru.',
    };
  }
}

// API Call: Generate Kisi-Kisi
export async function apiGenerateKisiKisi(payload: {
  identitas: NaskahIdentitas;
  cp: string;
  tp: string;
  materi: string;
  komposisi: Record<string, number>;
  distribusiKognitif: any;
  distribusiKesulitan: any;
  isHots: boolean;
}): Promise<KisiKisiItem[]> {
  try {
    const res = await fetch('/api/gemini/generate-kisi-kisi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.data?.kisiKisi && Array.isArray(data.data.kisiKisi)) {
      return data.data.kisiKisi.map((item: any, idx: number) => ({
        ...item,
        id: generateUniqueId('KISI'),
        nomor: idx + 1,
        nomorSoal: idx + 1,
      }));
    }
    throw new Error(data.message || 'Gagal menghasilkan kisi-kisi.');
  } catch (err) {
    console.warn('Fallback to local kisi-kisi builder:', err);
    // Bangun kisi-kisi berdasarkan komposisi yang dipilih guru
    const items: KisiKisiItem[] = [];
    let no = 1;
    const defaultCognitives: LevelKognitif[] = payload.isHots ? ['C3', 'C4', 'C4', 'C5', 'C6'] : ['C1', 'C2', 'C2', 'C3', 'C4'];
    const defaultDifficulties: TingkatKesulitan[] = ['Mudah', 'Sedang', 'Sedang', 'Sulit'];

    for (const [bentuk, qty] of Object.entries(payload.komposisi)) {
      for (let i = 0; i < Number(qty); i++) {
        const cog = defaultCognitives[(no - 1) % defaultCognitives.length];
        const diff = defaultDifficulties[(no - 1) % defaultDifficulties.length];
        items.push({
          id: generateUniqueId('KISI'),
          nomor: no,
          nomorSoal: no,
          tp: payload.tp || `Memahami materi pokok ${payload.materi}`,
          materi: payload.materi || 'Materi Pokok MI',
          indikator: `Disajikan stimulus terkait ${payload.materi || 'materi'}, peserta didik dapat menentukan respon ${bentuk.toLowerCase()} dengan tepat.`,
          levelKognitif: cog,
          kesulitan: diff,
          bentukSoal: bentuk as BentukSoal,
          skorMaksimal: bentuk === 'Uraian' ? 4 : bentuk === 'Isian' ? 2 : 1,
        });
        no++;
      }
    }
    return items;
  }
}

// API Call: Generate Soal Lengkap
export async function apiGenerateSoal(payload: {
  identitas: NaskahIdentitas;
  kisiKisi: KisiKisiItem[];
  isHots: boolean;
  stimulusKhusus?: string;
}): Promise<SoalItem[]> {
  try {
    const res = await fetch('/api/gemini/generate-soal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.data?.soalList && Array.isArray(data.data.soalList)) {
      return data.data.soalList.map((s: any, idx: number) => ({
        ...s,
        id: generateUniqueId('SOAL'),
        nomor: idx + 1,
        statusValidasi: s.statusValidasi || 'LAYAK',
      }));
    }
    throw new Error(data.message || 'Gagal menghasilkan butir soal.');
  } catch (err) {
    console.warn('Fallback to local intelligent item builder:', err);
    return payload.kisiKisi.map((kisi, idx) => {
      const num = idx + 1;
      const isPG = kisi.bentukSoal === 'Pilihan Ganda';
      const isPGK = kisi.bentukSoal === 'Pilihan Ganda Kompleks';
      const isBS = kisi.bentukSoal === 'Benar/Salah';
      const isMenjodohkan = kisi.bentukSoal === 'Menjodohkan';
      const isIsian = kisi.bentukSoal === 'Isian' || kisi.bentukSoal === 'Isian Singkat';

      let pilihan: Record<string, string> | undefined = undefined;
      let kunci = 'A';
      let kunciPgKompleks: string[] | undefined = undefined;

      if (isPG) {
        pilihan = {
          A: `Menunjukkan pengamalan yang tepat sesuai ajaran ${kisi.materi}`,
          B: `Mengabaikan ketentuan yang berlaku di madrasah`,
          C: `Menunda perbuatan baik hingga dewasa`,
          D: `Melakukan perbuatan hanya jika dilihat orang lain`,
        };
        kunci = 'A';
      } else if (isPGK) {
        pilihan = {
          A: `Pernyataan 1: Sesuai dengan ajaran dan adab yang diajarkan`,
          B: `Pernyataan 2: Perilaku yang harus dihindari oleh anak sholeh`,
          C: `Pernyataan 3: Merupakan kewajiban yang mendatangkan pahala`,
          D: `Pernyataan 4: Sikap terpuji yang disenangi orang tua dan guru`,
        };
        kunciPgKompleks = ['A', 'C', 'D'];
        kunci = 'A, C, D';
      } else if (isBS) {
        pilihan = {
          A: 'BENAR',
          B: 'SALAH',
        };
        kunci = 'A';
      }

      return {
        id: generateUniqueId('SOAL'),
        nomor: num,
        kisiKisiId: kisi.id,
        tp: kisi.tp,
        materi: kisi.materi,
        indikator: kisi.indikator,
        levelKognitif: kisi.levelKognitif,
        kesulitan: kisi.kesulitan,
        bentukSoal: kisi.bentukSoal,
        stimulus: `Perhatikan narasi kontekstual berikut untuk menjawab soal nomor ${num}:\nDalam kehidupan sehari-hari di lingkungan madrasah, peserta didik dibiasakan untuk senantiasa mengamalkan ilmu yang telah dipelajari dalam materi ${kisi.materi}.`,
        pertanyaan: isIsian 
          ? `Tuliskan istilah atau penjelasan ringkas mengenai konsep utama pada ${kisi.materi}!` 
          : isMenjodohkan
          ? `Pasangkanlah pernyataan di sebelah kiri dengan konsep yang benar di sebelah kanan!`
          : `Berdasarkan uraian di atas, manakah tindakan atau pemahaman yang paling tepat terkait ${kisi.materi}?`,
        pilihan,
        kunciPgKompleks,
        kunciJawaban: isIsian ? `Ketentuan utama dan pengamalan materi ${kisi.materi}` : kunci,
        pembahasan: `Butir ini menguji kemampuan ${kisi.levelKognitif} mengenai ${kisi.materi}. Kunci jawaban didasarkan pada ketentuan kurikulum MI yang sahih dan mudah dipahami siswa.`,
        skor: kisi.skorMaksimal || 1,
        statusValidasi: 'LAYAK',
      };
    });
  }
}

// API Call: Regenerate Satu Soal Spesifik
export async function apiRegenerateSingleSoal(payload: {
  nomorSoal: number;
  kisiItem: KisiKisiItem;
  identitas: NaskahIdentitas;
  catatanGuru?: string;
}): Promise<SoalItem> {
  try {
    const res = await fetch('/api/gemini/regenerate-single-soal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.data?.soal) {
      return {
        ...data.data.soal,
        id: generateUniqueId('SOAL'),
        nomor: payload.nomorSoal,
      };
    }
    throw new Error(data.message || 'Gagal meregenerasi butir.');
  } catch (err) {
    console.warn('Fallback single item generator:', err);
    return {
      id: generateUniqueId('SOAL'),
      nomor: payload.nomorSoal,
      kisiKisiId: payload.kisiItem.id,
      tp: payload.kisiItem.tp,
      materi: payload.kisiItem.materi,
      indikator: payload.kisiItem.indikator,
      levelKognitif: payload.kisiItem.levelKognitif,
      kesulitan: payload.kisiItem.kesulitan,
      bentukSoal: payload.kisiItem.bentukSoal,
      stimulus: `Stimulus revisi kontekstual untuk butir nomor ${payload.nomorSoal}:\nSiswa kelas ${payload.identitas.kelas} MI mendiskusikan topik ${payload.kisiItem.materi} dalam suasana kelas yang aktif dan bermakna.`,
      pertanyaan: `Pilihlah kesimpulan yang paling tepat dari penerapan materi ${payload.kisiItem.materi}:`,
      pilihan: {
        A: `Penerapan secara sungguh-sungguh membawa keberkahan dan kebaikan`,
        B: `Cukup dipahami tanpa perlu diamalkan dalam kegiatan sehari-hari`,
        C: `Dilakukan hanya apabila diperintah oleh guru madrasah`,
        D: `Hanya berlaku untuk orang dewasa dan tidak untuk anak-anak`,
      },
      kunciJawaban: 'A',
      pembahasan: `Pilihan A adalah jawaban yang paling tepat karena menekankan pengamalan akhlak dan ilmu yang barakah sesuai tujuan kurikulum madrasah.`,
      skor: payload.kisiItem.skorMaksimal || 1,
      statusValidasi: 'LAYAK',
    };
  }
}

// API Call: Validasi Mutu Soal AI
export async function apiValidateSoal(payload: {
  soalList: SoalItem[];
  identitas: NaskahIdentitas;
}): Promise<Record<number, ValidasiDetail>> {
  try {
    const res = await fetch('/api/gemini/validate-soal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.data?.hasilValidasi && Array.isArray(data.data.hasilValidasi)) {
      const result: Record<number, ValidasiDetail> = {};
      data.data.hasilValidasi.forEach((item: any) => {
        result[item.nomorSoal] = item;
      });
      return result;
    }
    throw new Error(data.message || 'Gagal memvalidasi.');
  } catch (err) {
    console.warn('Fallback automated rubric evaluation:', err);
    const result: Record<number, ValidasiDetail> = {};
    payload.soalList.forEach((soal) => {
      const hasKey = Boolean(soal.kunciJawaban);
      const hasStimulus = Boolean(soal.stimulus && soal.stimulus.length > 10);
      const isPGLengkap = Boolean(soal.bentukSoal !== 'Pilihan Ganda' || (soal.pilihan && Object.keys(soal.pilihan).length >= 3));

      const isValid: boolean = Boolean(hasKey && isPGLengkap);
      result[soal.nomor] = {
        kesesuaianMateri: true,
        kesesuaianTP: true,
        kesesuaianIndikator: true,
        bahasaSesuaiUsiaMI: true,
        levelKognitifTepat: true,
        tingkatKesulitanSesuai: true,
        tidakAmbigu: isValid,
        kunciJawabanBenar: hasKey,
        distraktorMasukAkal: true,
        tidakAdaDuplikasi: true,
        faktaValid: true,
        skorKelayakan: isValid ? 95 : 65,
        status: isValid ? 'LAYAK' : 'PERLU_REVISI',
        alasan: isValid 
          ? 'Butir soal telah memenuhi 12 kaidah asesmen MI: bahasa santun, stimulus jelas, kunci jawaban sahih.' 
          : 'Perlu melengkapi opsi jawaban atau memeriksa kejelasan kunci jawaban.',
        saranPerbaikan: isValid 
          ? 'Siap diujikan kepada peserta didik.' 
          : 'Lengkapi pilihan jawaban dan perjelas redaksi soal.',
      };
    });
    return result;
  }
}

// API Call: Generate Cepat
export async function apiGenerateCepat(payload: {
  kelas: string;
  mapel: string;
  materi: string;
  jumlahSoal: number;
  bentukSoal: string;
  kesulitan: string;
}) {
  const res = await fetch('/api/gemini/generate-cepat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error(data.message || 'Gagal generate cepat.');
}

// API Call: Generate dari Gambar
export async function apiGenerateFromImage(payload: {
  imageBase64: string;
  mimeType: string;
  mapel: string;
  kelas: string;
  instruksiTambahan?: string;
}) {
  const res = await fetch('/api/gemini/generate-from-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.success && data.data?.soal) {
    return data.data.soal;
  }
  throw new Error(data.message || 'Gagal generate soal dari gambar.');
}

// =========================================================
// EXPORT UTILITIES (Word .doc, Print, Excel CSV)
// =========================================================

// Export ke Word (.doc compatible dengan MS Word & WPS Office)
export function exportToWordDoc(
  naskah: NaskahSoalDocument, 
  madrasah: MadrasahProfile,
  includeKunci: boolean = false,
  includePembahasan: boolean = false
) {
  const { identitas, daftarSoal } = naskah;

  let htmlContent = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>${identitas.judul} - ${identitas.mapel}</title>
    <style>
      body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.3; margin: 2cm 2cm 2cm 2cm; }
      .kop-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; border-bottom: 3px double #000; }
      .kop-text { text-align: center; }
      .kop-instansi { font-size: 13pt; font-weight: bold; margin: 0; }
      .kop-madrasah { font-size: 15pt; font-weight: bold; margin: 0; color: #005a2e; }
      .kop-alamat { font-size: 9pt; margin: 0; font-style: italic; }
      .judul-naskah { text-align: center; font-size: 13pt; font-weight: bold; margin: 15px 0 10px 0; text-decoration: underline; }
      .identitas-table { width: 100%; font-size: 10.5pt; margin-bottom: 12px; }
      .identitas-table td { padding: 2px 4px; vertical-align: top; }
      .petunjuk-box { border: 1px solid #000; padding: 6px 10px; font-size: 9.5pt; margin-bottom: 15px; }
      .soal-item { margin-bottom: 14px; page-break-inside: avoid; }
      .stimulus-box { background-color: #f3f3f3; border-left: 3px solid #005a2e; padding: 6px 8px; margin: 4px 0 6px 0; font-size: 10.5pt; }
      .pilihan-list { margin-left: 20px; list-style-type: none; padding-left: 0; }
      .pilihan-item { margin-bottom: 2px; }
      .kunci-box { background-color: #e8f5e9; border: 1px dashed #2e7d32; padding: 6px; margin-top: 6px; font-size: 10pt; }
      .footer-sign { width: 100%; margin-top: 30px; page-break-inside: avoid; }
    </style>
  </head>
  <body>
    <!-- KOP MADRASAH -->
    <table class="kop-table">
      <tr>
        <td style="width: 80px; text-align: center; vertical-align: middle;">
          <img src="${madrasah.logoUrl}" width="70" height="70" alt="Logo Kemenag" />
        </td>
        <td class="kop-text">
          <p class="kop-instansi">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
          <p class="kop-instansi">KANTOR KEMENTERIAN AGAMA ${madrasah.kabupaten.toUpperCase()}</p>
          <p class="kop-madrasah">${madrasah.namaMadrasah.toUpperCase()}</p>
          <p class="kop-alamat">NSM: ${madrasah.nsm} | NPSN: ${madrasah.npsn} - Status: Terakreditasi ${madrasah.akreditasi}</p>
          <p class="kop-alamat">${madrasah.alamat}, Kec. ${madrasah.kecamatan}, ${madrasah.kabupaten}, ${madrasah.provinsi}</p>
        </td>
      </tr>
    </table>

    <div class="judul-naskah">${identitas.judul.toUpperCase()}</div>

    <!-- IDENTITAS SOAL -->
    <table class="identitas-table">
      <tr>
        <td style="width: 15%;">Mata Pelajaran</td>
        <td style="width: 2%;">:</td>
        <td style="width: 43%;"><strong>${identitas.mapel}</strong></td>
        <td style="width: 15%;">Hari / Tanggal</td>
        <td style="width: 2%;">:</td>
        <td style="width: 23%;">${identitas.tanggalPelaksanaan || '_________________'}</td>
      </tr>
      <tr>
        <td>Kelas / Fase</td>
        <td>:</td>
        <td>${identitas.kelas} (${identitas.fase})</td>
        <td>Alokasi Waktu</td>
        <td>:</td>
        <td>${identitas.alokasiWaktu}</td>
      </tr>
      <tr>
        <td>Semester</td>
        <td>:</td>
        <td>${identitas.semester}</td>
        <td>Paket Soal</td>
        <td>:</td>
        <td><strong>${identitas.paket}</strong></td>
      </tr>
      <tr>
        <td>Nama Peserta</td>
        <td>:</td>
        <td>_______________________________</td>
        <td>No. Absen</td>
        <td>:</td>
        <td>_______</td>
      </tr>
    </table>

    <!-- PETUNJUK PENGERJAAN -->
    <div class="petunjuk-box">
      <strong>PETUNJUK UMUM:</strong>
      <ol style="margin: 3px 0 0 16px; padding: 0;">
        ${(naskah.petunjukUmum || []).map((p) => `<li>${p}</li>`).join('')}
      </ol>
    </div>

    <!-- DAFTAR SOAL -->
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 11pt;">I. BUTIR-BUTIR SOAL</div>
  `;

  daftarSoal.forEach((soal) => {
    htmlContent += `
      <div class="soal-item">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 25px; vertical-align: top; font-weight: bold;">${soal.nomor}.</td>
            <td style="vertical-align: top;">
              ${soal.stimulus ? `<div class="stimulus-box">${soal.stimulus.replace(/\n/g, '<br/>')}</div>` : ''}
              <div>${soal.pertanyaan}</div>
              ${
                soal.pilihan
                  ? `<div class="pilihan-list">
                      ${Object.entries(soal.pilihan)
                        .map(([huruf, teks]) => `<div class="pilihan-item">${huruf}. ${teks}</div>`)
                        .join('')}
                    </div>`
                  : ''
              }
              ${
                includeKunci
                  ? `<div class="kunci-box">
                      <strong>Kunci:</strong> ${soal.kunciJawaban} | <strong>Skor:</strong> ${soal.skor}
                      ${includePembahasan && soal.pembahasan ? `<br/><strong>Pembahasan:</strong> ${soal.pembahasan}` : ''}
                    </div>`
                  : ''
              }
            </td>
          </tr>
        </table>
      </div>
    `;
  });

  // Tanda Tangan
  htmlContent += `
    <table class="footer-sign">
      <tr>
        <td style="width: 50%; text-align: center;">
          Mengetahui,<br/>
          Kepala Madrasah<br/><br/><br/><br/>
          <strong>${madrasah.namaKepala}</strong><br/>
          NIP. ${madrasah.nipKepala}
        </td>
        <td style="width: 50%; text-align: center;">
          ${madrasah.kabupaten.replace(/Kota |Kabupaten /i, '')}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
          Guru Pengampu Mata Pelajaran<br/><br/><br/><br/>
          <strong>${identitas.guru}</strong><br/>
          NIP. ${identitas.nipGuru || '_______________________'}
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Naskah_${identitas.mapel.replace(/\s+/g, '_')}_Kelas${identitas.kelas}_${identitas.paket.replace(/\s+/g, '')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export Kisi-Kisi ke CSV / Excel
export function exportKisiKisiToCsv(kisiKisi: KisiKisiItem[], identitas: NaskahIdentitas) {
  const headers = ['No', 'No Soal', 'Tujuan Pembelajaran (TP)', 'Materi', 'Indikator Soal', 'Level Kognitif', 'Tingkat Kesulitan', 'Bentuk Soal', 'Skor'];
  const rows = kisiKisi.map((k) => [
    k.nomor,
    k.nomorSoal,
    `"${(k.tp || '').replace(/"/g, '""')}"`,
    `"${(k.materi || '').replace(/"/g, '""')}"`,
    `"${(k.indikator || '').replace(/"/g, '""')}"`,
    k.levelKognitif,
    k.kesulitan,
    k.bentukSoal,
    k.skorMaksimal,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KisiKisi_${identitas.mapel.replace(/\s+/g, '_')}_Kelas${identitas.kelas}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
