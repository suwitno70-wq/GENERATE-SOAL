import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Inisialisasi Google GenAI SDK (Server-Side)
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Peringatan: GEMINI_API_KEY belum terkonfigurasi di environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper: Sanitize & parse JSON from AI response
const safeParseJson = (rawText: string) => {
  try {
    let clean = rawText.trim();
    // Hilangkan blok kode markdown jika ada
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return JSON.parse(clean);
  } catch (err) {
    console.error("Gagal parse JSON AI:", err, rawText.slice(0, 300));
    // Coba temukan substring objek JSON pertama
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      } catch (innerErr) {
        throw new Error("Format respon AI tidak dapat dibaca sebagai JSON valid.");
      }
    }
    throw new Error("Format respon AI tidak dapat dibaca sebagai JSON valid.");
  }
};

// ==========================================
// API ROUTES (FIRST)
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// 1. Bantu AI Kurikulum (CP, TP, ATP, Indikator)
app.post("/api/gemini/curriculum-helper", async (req, res) => {
  try {
    const { mapel, kelas, fase, kurikulum, topikMateri, elemen } = req.body;
    const ai = getGenAI();

    const prompt = `
Anda adalah Ahli Kurikulum Madrasah Ibtidaiyah (MI) Kemenag RI dan Pengembang Kurikulum Madrasah berpedoman pada KMA Nomor 1503 (tentang Pedoman Implementasi Kurikulum pada Madrasah: Pembelajaran Mendalam / Deep Learning, Kurikulum Berbasis Cinta / Panca Cinta, serta Capaian Pembelajaran PAI & Bahasa Arab dan Mata Pelajaran Umum).

Buatkan DRAFT dokumen kurikulum resmi berlandaskan KMA 1503 untuk:
- Jenjang: Madrasah Ibtidaiyah (MI)
- Mata Pelajaran: ${mapel || "Fikih"}
- Kelas: ${kelas || "4"} (${fase || "Fase B"})
- Acuan Kurikulum: ${kurikulum || "Kurikulum Madrasah (KMA 1503)"}
- Topik / Materi Pokok: ${topikMateri || "Tanda-tanda Balig"}
- Elemen: ${elemen || "Materi Pokok"}

PRINSIP KMA 1503 YANG WAJIB DITERAPKAN:
1. Deep Learning: Rumusan TP dan ATP mendorong pemahaman konsep bermakna, berpikir kritis, dan aplikasi nyata anak MI (bukan sekadar menghafal).
2. Nilai Panca Cinta: Menumbuhkan cinta Allah & Rasul, cinta ilmu, cinta lingkungan, cinta diri & sesama, serta cinta tanah air secara kontekstual.

Hasilkan JSON persis dengan format berikut:
{
  "cp": "Rumusan Capaian Pembelajaran resmi KMA 1503 untuk fase ini",
  "tp": [
    {
      "nomor": 1,
      "tujuan": "Rumusan TP 1 yang operasional berbasis KKO Anderson/Bloom terpadu KMA 1503",
      "materi": "Submateri spesifik"
    },
    {
      "nomor": 2,
      "tujuan": "Rumusan TP 2",
      "materi": "Submateri spesifik"
    }
  ],
  "atp": [
    {
      "urutan": 1,
      "alur": "Alur pembelajaran 1 yang bertahap dari pemahaman esensial menuju aplikasi bermakna"
    },
    {
      "urutan": 2,
      "alur": "Alur pembelajaran 2"
    }
  ],
  "indikator": [
    "Disajikan stimulus narasi kontekstual, peserta didik dapat ...",
    "Disajikan contoh kasus kehidupan sehari-hari, peserta didik dapat ..."
  ],
  "catatan": "Draft AI berpedoman KMA 1503 — wajib ditinjau dan disesuaikan guru."
}

PENTING: Gunakan bahasa Indonesia baku, santun, sesuai perkembangan kognitif anak usia Madrasah Ibtidaiyah. Kembalikan HANYA JSON murni tanpa markdown pembuka.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = safeParseJson(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error curriculum helper:", error);
    res.status(500).json({
      success: false,
      message: "Maaf, proses AI belum berhasil. Silakan coba lagi.",
      error: error?.message,
    });
  }
});

// 2. Generator Kisi-Kisi AI
app.post("/api/gemini/generate-kisi-kisi", async (req, res) => {
  try {
    const { identitas, cp, tp, materi, komposisi, distribusiKognitif, distribusiKesulitan, isHots } = req.body;
    const ai = getGenAI();

    const prompt = `
Anda adalah Pengembang Asesmen Pendidikan Madrasah Ibtidaiyah berstandar KMA Nomor 1503.
Tugas: Buat tabel kisi-kisi naskah soal asesmen resmi MI berpedoman kurikulum KMA 1503.

DATA ASESMEN:
- Madrasah: ${identitas?.madrasah || "Madrasah Ibtidaiyah"}
- Mata Pelajaran: ${identitas?.mapel || "Pelajaran MI"}
- Kelas / Semester: ${identitas?.kelas || "4"} / ${identitas?.semester || "1 (Ganjil)"}
- Acuan Kurikulum: ${identitas?.kurikulum || "Kurikulum Madrasah (KMA 1503)"}
- Jenis Asesmen: ${identitas?.jenisAsesmen || "Sumatif"}
- CP: ${cp || "-"}
- TP Utama: ${tp || "-"}
- Materi: ${materi || "-"}
- Komposisi Bentuk Soal: ${JSON.stringify(komposisi || {})}
- Mode Kognitif: ${distribusiKognitif?.mode || "otomatis"}
- Mode HOTS: ${isHots ? "Ya (prioritaskan C4-C6 yang ramah usia MI, Deep Learning)" : "Standar"}

ATURAN KISI-KISI KMA 1503:
1. Menekankan Pembelajaran Mendalam (Deep Learning): Indikator butir soal menguji pemahaman konsep esensial, penalaran kontekstual, dan nilai Panca Cinta (bukan sekadar tes hafalan dangkal).
2. Indikator soal harus operasional, diawali dengan stimulus yang jelas (misal: "Disajikan teks cerita kontekstual...", "Disajikan ilustrasi gambar...", "Diberikan tabel data...").
3. Nomor soal harus urut dari 1 sampai total jumlah soal.
4. Level kognitif gunakan kode C1, C2, C3, C4, C5, atau C6.
5. Tingkat kesulitan: "Mudah", "Sedang", "Sulit".

Hasilkan respon HANYA dalam format JSON berikut:
{
  "kisiKisi": [
    {
      "nomor": 1,
      "tp": "Tujuan Pembelajaran butir ini",
      "materi": "Materi spesifik butir ini",
      "indikator": "Disajikan ilustrasi konteks sehari-hari, peserta didik dapat menentukan...",
      "levelKognitif": "C2",
      "kesulitan": "Mudah",
      "bentukSoal": "Pilihan Ganda",
      "nomorSoal": 1,
      "skorMaksimal": 1
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsed = safeParseJson(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error generate kisi-kisi:", error);
    res.status(500).json({
      success: false,
      message: "Maaf, proses pembuatan kisi-kisi AI belum berhasil. Silakan coba lagi.",
      error: error?.message,
    });
  }
});

// 3. Generator Naskah Soal Lengkap AI (Berdasarkan Kisi-Kisi)
app.post("/api/gemini/generate-soal", async (req, res) => {
  try {
    const { identitas, kisiKisi, isHots, stimulusKhusus } = req.body;
    const ai = getGenAI();

    const prompt = `
Anda adalah Pembuat Soal Asesmen Profesional Madrasah Ibtidaiyah (Kemenag RI) berpedoman pada KMA Nomor 1503.
Tugas: Buatkan butir-butir soal LENGKAP dengan kunci jawaban dan pembahasan pedagogis berlandaskan KMA 1503 berdasarkan kisi-kisi berikut.

IDENTITAS SOAL:
- Mapel: ${identitas?.mapel || "Pelajaran MI"}
- Kelas: ${identitas?.kelas || "4"} MI
- Semester: ${identitas?.semester || "1"}
- Acuan Kurikulum: ${identitas?.kurikulum || "Kurikulum Madrasah (KMA 1503)"}
- Jenis Asesmen: ${identitas?.jenisAsesmen || "Asesmen Sumatif"}
- Mode HOTS: ${isHots ? "Aktif (Konteks kontekstual, penalaran logis, Deep Learning KMA 1503)" : "Normal"}
${stimulusKhusus ? `- Stimulus Tambahan Guru: ${stimulusKhusus}` : ""}

KISI-KISI ACUAN (WAJIB DIIKUTI TIAP NOMOR):
${JSON.stringify(kisiKisi || [], null, 2)}

ATURAN KUALITAS SOAL KMA 1503 MADRASAH IBTIDAIYAH (WAJIB DITAATI):
1. Berorientasi Deep Learning KMA 1503: Menguji pemahaman konsep esensial yang bermakna dan aplikatif dalam kehidupan siswa MI, bukan hafalan kata per kata yang kaku.
2. Integrasi Nilai Luhur Panca Cinta KMA 1503: Hadirkan stimulus yang menanamkan cinta Allah & Rasul, cinta ilmu, cinta lingkungan, cinta sesama manusia, atau cinta tanah air.
3. Sesuai usia kognitif siswa kelas ${identitas?.kelas || "4"} MI (kalimat jelas, lugas, santun, tidak bertele-tele).
4. Kunci jawaban WAJIB PASTI BENAR, jangan ada opsi ganda atau ambigu.
5. Pilihan ganda untuk MI kelas 1-3 umumnya 3 pilihan (A, B, C); untuk kelas 4-6 adalah 4 pilihan (A, B, C, D).
6. Pada soal Pilihan Ganda Kompleks: sediakan pilihan dan tentukan opsi benar yang lebih dari satu, contoh kunci: "A, C" atau "A, B, D".
7. Pada soal Menjodohkan: sediakan pasangan kiri dan pasangan kanan yang jelas dan terukur.
8. Pada soal Isian/Uraian: sertakan kunci jawaban yang lugas serta pedoman penskoran transparan.
9. Tiap soal WAJIB menyertakan "pembahasan" pedagogis yang mendidik dan mudah dipahami guru saat evaluasi.

Hasilkan JSON dengan format persis:
{
  "soalList": [
    {
      "nomor": 1,
      "tp": "...",
      "materi": "...",
      "indikator": "...",
      "levelKognitif": "C2",
      "kesulitan": "Mudah",
      "bentukSoal": "Pilihan Ganda",
      "stimulus": "Teks pengantar atau cerita pendek jika ada",
      "pertanyaan": "Kalimat pertanyaan yang jelas dan tidak ambigu",
      "pilihan": {
        "A": "Pilihan A",
        "B": "Pilihan B",
        "C": "Pilihan C",
        "D": "Pilihan D"
      },
      "kunciJawaban": "B",
      "pembahasan": "Penjelasan mengapa B benar dan distraktor lain salah...",
      "skor": 1,
      "statusValidasi": "LAYAK"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.65,
      },
    });

    const parsed = safeParseJson(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error generate soal:", error);
    res.status(500).json({
      success: false,
      message: "Maaf, proses AI pembuatan soal belum berhasil. Silakan coba lagi.",
      error: error?.message,
    });
  }
});

// 4. Regenerate SATU Butir Soal Spesifik
app.post("/api/gemini/regenerate-single-soal", async (req, res) => {
  try {
    const { nomorSoal, kisiItem, identitas, catatanGuru } = req.body;
    const ai = getGenAI();

    const prompt = `
Anda adalah Pembuat Soal Asesmen Madrasah Ibtidaiyah.
Tugas: Buatkan 1 (SATU) butir soal BARU yang berbeda untuk menggantikan soal nomor ${nomorSoal}.
JANGAN ubah nomor atau parameter kisi-kisi!

PARAMETER BUTIR:
- Nomor: ${nomorSoal}
- Mapel: ${identitas?.mapel || "Pelajaran MI"}
- Kelas: ${identitas?.kelas || "4"} MI
- TP: ${kisiItem?.tp || "-"}
- Materi: ${kisiItem?.materi || "-"}
- Indikator: ${kisiItem?.indikator || "-"}
- Bentuk Soal: ${kisiItem?.bentukSoal || "Pilihan Ganda"}
- Level: ${kisiItem?.levelKognitif || "C2"}
- Kesulitan: ${kisiItem?.kesulitan || "Sedang"}
${catatanGuru ? `- Permintaan Khusus Guru: ${catatanGuru}` : ""}

Hasilkan JSON 1 butir soal:
{
  "soal": {
    "nomor": ${nomorSoal},
    "tp": "${kisiItem?.tp || ""}",
    "materi": "${kisiItem?.materi || ""}",
    "indikator": "${kisiItem?.indikator || ""}",
    "levelKognitif": "${kisiItem?.levelKognitif || "C2"}",
    "kesulitan": "${kisiItem?.kesulitan || "Sedang"}",
    "bentukSoal": "${kisiItem?.bentukSoal || "Pilihan Ganda"}",
    "stimulus": "Stimulus cerita/narasi kontekstual anak MI baru",
    "pertanyaan": "Pertanyaan baru yang tajam dan tidak ambigu",
    "pilihan": {
      "A": "Pilihan A",
      "B": "Pilihan B",
      "C": "Pilihan C",
      "D": "Pilihan D"
    },
    "kunciJawaban": "C",
    "pembahasan": "Pembahasan rinci dan mendidik...",
    "skor": ${kisiItem?.skorMaksimal || 1},
    "statusValidasi": "LAYAK"
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsed = safeParseJson(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error regenerate single soal:", error);
    res.status(500).json({
      success: false,
      message: "Maaf, pembuatan ulang butir soal belum berhasil. Silakan coba lagi.",
      error: error?.message,
    });
  }
});

// 5. Validasi Mutu Soal AI (12 Rubrik Standar Asesmen MI)
app.post("/api/gemini/validate-soal", async (req, res) => {
  try {
    const { soalList, identitas } = req.body;
    const ai = getGenAI();

    const prompt = `
Anda adalah Pakar Asesmen Pendidikan & Telaah Butir Soal Madrasah Ibtidaiyah.
Tugas: Lakukan telaah butir soal (validasi kualitatif dan materi) secara teliti untuk setiap soal berikut.

DATA ASESMEN:
- Mapel: ${identitas?.mapel || "Pelajaran MI"}
- Kelas: ${identitas?.kelas || "4"} MI

DAFTAR SOAL YANG HARUS DITELAAH:
${JSON.stringify(soalList || [], null, 2)}

KRITERIA EVALUASI (12 ASPEK):
1. Kesesuaian dengan materi & TP
2. Kesesuaian dengan indikator
3. Ketepatan bahasa untuk usia anak MI
4. Ketepatan level kognitif (C1-C6)
5. Kesesuaian tingkat kesukaran
6. Kejelasan stimulus & pertanyaan (tidak ambigu)
7. Kebenaran mutlak kunci jawaban
8. Kualitas distraktor (pengecoh logis dan homogen)
9. Tidak ada duplikasi atau petunjuk jawaban dari soal lain
10. Kebenaran fakta ilmiah / syariat / matematika
11. Tidak mengandung bias SARA atau kekerasan
12. Kelayakan cetak dan asesmen

STATUS:
- "LAYAK" (Bila memenuhi kaidah)
- "PERLU_REVISI" (Ada cacat minor pada distraktor/bahasa tapi bisa diperbaiki)
- "TIDAK_LAYAK" (Kunci salah fatal, ambigu parah, atau di luar materi MI)

Hasilkan JSON dengan format persis:
{
  "hasilValidasi": [
    {
      "nomorSoal": 1,
      "kesesuaianMateri": true,
      "kesesuaianTP": true,
      "kesesuaianIndikator": true,
      "bahasaSesuaiUsiaMI": true,
      "levelKognitifTepat": true,
      "tingkatKesulitanSesuai": true,
      "tidakAmbigu": true,
      "kunciJawabanBenar": true,
      "distraktorMasukAkal": true,
      "tidakAdaDuplikasi": true,
      "faktaValid": true,
      "skorKelayakan": 95,
      "status": "LAYAK",
      "alasan": "Soal sangat baik, stimulus kontekstual, kunci jawaban tepat.",
      "saranPerbaikan": "Pertahankan kualitas rumusan kalimat."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = safeParseJson(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error validate soal:", error);
    res.status(500).json({
      success: false,
      message: "Maaf, proses validasi soal AI belum berhasil. Silakan coba lagi.",
      error: error?.message,
    });
  }
});

// 6. Generate Cepat (⚡ Fitur Generate Cepat End-to-End)
app.post("/api/gemini/generate-cepat", async (req, res) => {
  try {
    const { kelas, mapel, materi, jumlahSoal, bentukSoal, kesulitan } = req.body;
    const ai = getGenAI();

    const prompt = `
Anda adalah AI Generator Soal MI super cepat dan akurat berpedoman KMA Nomor 1503 (Deep Learning & Panca Cinta).
Buat secara INSTAN: Indikator, Kisi-Kisi, Soal, Kunci, dan Pembahasan untuk:
- Mapel: ${mapel}
- Kelas: ${kelas} Madrasah Ibtidaiyah
- Acuan Kurikulum: Kurikulum Madrasah (KMA 1503)
- Materi Pokok: ${materi}
- Jumlah Soal: ${jumlahSoal || 5}
- Bentuk Utama: ${bentukSoal || "Pilihan Ganda"}
- Tingkat Kesulitan: ${kesulitan || "Sedang"}

Hasilkan JSON terstruktur langsung:
{
  "tp": "Tujuan pembelajaran utama",
  "kisiKisi": [
    {
      "nomor": 1,
      "tp": "...",
      "materi": "${materi}",
      "indikator": "Disajikan ..., siswa dapat ...",
      "levelKognitif": "C2",
      "kesulitan": "${kesulitan || "Sedang"}",
      "bentukSoal": "${bentukSoal || "Pilihan Ganda"}",
      "nomorSoal": 1,
      "skorMaksimal": 1
    }
  ],
  "soalList": [
    {
      "nomor": 1,
      "tp": "...",
      "materi": "${materi}",
      "indikator": "...",
      "levelKognitif": "C2",
      "kesulitan": "${kesulitan || "Sedang"}",
      "bentukSoal": "${bentukSoal || "Pilihan Ganda"}",
      "stimulus": "Stimulus pendek yang menarik",
      "pertanyaan": "Pertanyaan yang jelas",
      "pilihan": {
        "A": "Pilihan A",
        "B": "Pilihan B",
        "C": "Pilihan C",
        "D": "Pilihan D"
      },
      "kunciJawaban": "A",
      "pembahasan": "Penjelasan singkat padat...",
      "skor": 1,
      "statusValidasi": "LAYAK"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = safeParseJson(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error generate cepat:", error);
    res.status(500).json({
      success: false,
      message: "Maaf, proses Generate Cepat belum berhasil. Silakan coba lagi.",
      error: error?.message,
    });
  }
});

// 7. Soal Berbasis Gambar (Analisis gambar base64)
app.post("/api/gemini/generate-from-image", async (req, res) => {
  try {
    const { imageBase64, mimeType, mapel, kelas, instruksiTambahan } = req.body;
    const ai = getGenAI();

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "Data gambar tidak ditemukan." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const promptText = `
Anda adalah Pembuat Soal Asesmen MI.
Analisis gambar stimulus yang dilampirkan ini secara cermat.
Tugas: Buat 1 butir soal Asesmen Madrasah Ibtidaiyah yang mengacu langsung pada fakta/informasi/diagram yang terlihat pada gambar.
- Mapel: ${mapel || "Ilmu Pengetahuan Alam dan Sosial (IPAS)"}
- Jenjang: Kelas ${kelas || "4"} MI
${instruksiTambahan ? `- Petunjuk Guru: ${instruksiTambahan}` : ""}

ATURAN KETAT: DILARANG mengarang fakta yang tidak terlihat atau tidak dapat disimpulkan secara wajar dari gambar!

Hasilkan JSON:
{
  "soal": {
    "nomor": 1,
    "tp": "Menganalisis informasi visual dari gambar stimulus",
    "materi": "Analisis Gambar Visual",
    "indikator": "Disajikan gambar stimulus, peserta didik dapat menyimpulkan informasi berdasarkan pengamatan visual.",
    "levelKognitif": "C4",
    "kesulitan": "Sedang",
    "bentukSoal": "Pilihan Ganda",
    "stimulus": "Perhatikan gambar yang disajikan dengan saksama!",
    "pertanyaan": "Berdasarkan gambar tersebut, ...",
    "pilihan": {
      "A": "Pilihan A",
      "B": "Pilihan B",
      "C": "Pilihan C",
      "D": "Pilihan D"
    },
    "kunciJawaban": "A",
    "pembahasan": "Analisis visual membuktikan bahwa...",
    "skor": 1,
    "statusValidasi": "LAYAK"
  }
}
`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: cleanBase64,
      },
    };

    const textPart = {
      text: promptText,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [imagePart, textPart] },
    });

    const parsed = safeParseJson(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error generate from image:", error);
    res.status(500).json({
      success: false,
      message: "Maaf, analisis gambar dan pembuatan soal belum berhasil. Silakan coba lagi.",
      error: error?.message,
    });
  }
});

// ==========================================
// VITE MIDDLEWARE / STATIC FILES (LAST)
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI GENERATOR SOAL MI] Server aktif di http://0.0.0.0:${PORT}`);
  });
}

startServer();
