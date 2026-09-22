import React, { useState } from 'react';
import { 
  Settings, 
  School, 
  Database, 
  Download, 
  Upload, 
  Save, 
  Code, 
  Copy, 
  Check, 
  Cpu, 
  FileText,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { MadrasahProfile, ActivityLog, NaskahSoalDocument, SoalItem, KisiKisiDokumen } from '../types';

interface SettingsViewProps {
  madrasah: MadrasahProfile;
  onUpdateMadrasah: (profile: MadrasahProfile) => void;
  bankSoal: SoalItem[];
  naskahList: NaskahSoalDocument[];
  kisiKisiList: KisiKisiDokumen[];
  activityLogs: ActivityLog[];
  onRestoreDatabase: (data: any) => void;
}

const GAS_SCRIPTS = [
  {
    name: 'Code.gs',
    description: 'Entry point Google Apps Script Web App (doGet, doPost, include HTML)',
    code: `// =========================================================
// AI GENERATOR SOAL MADRASAH IBTIDAIYAH - KREATIF BY WITNO
// File: Code.gs
// =========================================================

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('AI Generator Soal MI - Kreatif by Witno')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    switch (action) {
      case 'generateSoal':
        return ContentService.createTextOutput(JSON.stringify(generateSoalGAS(postData.payload)))
          .setMimeType(ContentService.MimeType.JSON);
      case 'generateKisiKisi':
        return ContentService.createTextOutput(JSON.stringify(generateKisiKisiGAS(postData.payload)))
          .setMimeType(ContentService.MimeType.JSON);
      case 'validateSoal':
        return ContentService.createTextOutput(JSON.stringify(validateSoalGAS(postData.payload)))
          .setMimeType(ContentService.MimeType.JSON);
      default:
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Aksi tidak dikenal' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`
  },
  {
    name: 'Config.gs',
    description: 'Konfigurasi Spreadsheet, API Key Gemini, Nama Sheet',
    code: `// =========================================================
// File: Config.gs
// =========================================================

const CONFIG = {
  APP_NAME: 'AI GENERATOR SOAL MI',
  BRANDING: 'Kreatif by Witno',
  VERSION: '2.6',
  GEMINI_MODEL: 'gemini-2.5-flash',
  
  // Sheet Names
  SHEETS: {
    MADRASAH: 'DATA_MADRASAH',
    CP: 'MASTER_CP',
    TP: 'MASTER_TP',
    KISI_KISI: 'KISI_KISI',
    SOAL: 'BANK_SOAL',
    NASKAH: 'NASKAH_SOAL',
    LOG: 'LOG_AKTIVITAS',
  }
};

function getGeminiApiKey() {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi di Script Properties Google Apps Script!');
  }
  return key;
}`
  },
  {
    name: 'AI.gs',
    description: 'Koneksi REST API Gemini 2.5 Flash dari Google Apps Script',
    code: `// =========================================================
// File: AI.gs - Engine Pemanggil Gemini AI
// =========================================================

function callGeminiAI(promptText, systemInstruction) {
  const apiKey = getGeminiApiKey();
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + CONFIG.GEMINI_MODEL + ':generateContent?key=' + apiKey;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json'
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  if (json.candidates && json.candidates[0].content.parts[0].text) {
    const rawText = json.candidates[0].content.parts[0].text;
    return JSON.parse(rawText);
  } else {
    throw new Error('Gagal mendapatkan respon valid dari Gemini AI: ' + JSON.stringify(json));
  }
}`
  },
  {
    name: 'Export.gs',
    description: 'Export naskah soal ke Google Docs, Word (.doc), dan PDF',
    code: `// =========================================================
// File: Export.gs - Generator Google Docs / PDF
// =========================================================

function exportNaskahToGoogleDoc(naskahId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const naskahSheet = ss.getSheetByName(CONFIG.SHEETS.NASKAH);
  // Logika pembentukan file Google Docs resmi dengan Kop Kemenag...
  const doc = DocumentApp.create('Naskah_Soal_' + naskahId);
  const body = doc.getBody();
  body.appendParagraph('KEMENTERIAN AGAMA REPUBLIK INDONESIA').setBold(true).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  return doc.getUrl();
}`
  },
  {
    name: 'appsscript.json',
    description: 'Manifest konfigurasi Apps Script Runtime',
    code: `{
  "timeZone": "Asia/Jakarta",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}`
  }
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  madrasah,
  onUpdateMadrasah,
  bankSoal,
  naskahList,
  kisiKisiList,
  activityLogs,
  onRestoreDatabase,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'backup' | 'gas' | 'logs'>('profil');

  // Form Profile state
  const [form, setForm] = useState<MadrasahProfile>({ ...madrasah });
  const [isSaved, setIsSaved] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMadrasah(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2.6',
      appName: 'AI Generator Soal MI',
      exportedAt: new Date().toISOString(),
      madrasah: form,
      bankSoal,
      naskahList,
      kisiKisiList,
      activityLogs,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Soal_MI_${form.namaMadrasah.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.madrasah && data.bankSoal) {
          onRestoreDatabase(data);
          alert('Database berhasil dipulihkan!');
        } else {
          alert('Format file cadangan tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>Pengaturan Sistem & Profil Madrasah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan identitas kop surat resmi, kelola cadangan data, atau ekspor kode Google Apps Script.
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('profil')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'profil'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Profil Madrasah & Kop</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'backup'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cadangkan & Pulihkan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gas')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'gas'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code className="w-4 h-4 text-amber-300" />
          <span>📦 Kode Google Apps Script (GAS)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Log Aktivitas</span>
        </button>
      </div>

      {/* SUB-TAB 1: PROFIL MADRASAH */}
      {activeSubTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Identitas Kop Surat Kemenag</h3>
              <p className="text-xs text-slate-500">Data ini akan dicetak pada bagian atas naskah soal dan Word/PDF.</p>
            </div>
            {isSaved && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Berhasil Disimpan</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Madrasah</label>
              <input
                type="text"
                value={form.namaMadrasah}
                onChange={(e) => setForm({ ...form, namaMadrasah: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL Logo Madrasah / Kemenag</label>
              <input
                type="text"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NSM</label>
                <input
                  type="text"
                  value={form.nsm}
                  onChange={(e) => setForm({ ...form, nsm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  value={form.npsn}
                  onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Akreditasi</label>
                <input
                  type="text"
                  value={form.akreditasi}
                  onChange={(e) => setForm({ ...form, akreditasi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={form.kabupaten}
                  onChange={(e) => setForm({ ...form, kabupaten: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Madrasah</label>
              <input
                type="text"
                value={form.namaKepala}
                onChange={(e) => setForm({ ...form, namaKepala: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Madrasah</label>
              <input
                type="text"
                value={form.nipKepala}
                onChange={(e) => setForm({ ...form, nipKepala: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Madrasah</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: CADANGKAN & PULIHKAN */}
      {activeSubTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Cadangkan & Pulihkan Database</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simpan seluruh naskah, kisi-kisi, dan bank soal ke komputer atau Google Drive Anda dalam format JSON mandiri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Download className="w-5 h-5 text-blue-700" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Unduh Cadangan Lengkap</h4>
              <p className="text-xs text-slate-500">
                Mencakup {naskahList.length} Naskah, {bankSoal.length} Butir Soal, dan {kisiKisiList.length} Kisi-kisi.
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File .JSON</span>
              </button>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5 text-purple-700" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Pulihkan dari File Cadangan</h4>
              <p className="text-xs text-slate-500">
                Pilih file .JSON hasil ekspor sebelumnya untuk mengembalikan seluruh data aplikasi.
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GOOGLE APPS SCRIPT SOURCE CODE */}
      {activeSubTab === 'gas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-800">
                📦 Ekspor Kode Google Apps Script (Master Architecture)
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                GAS Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bagi guru atau madrasah yang ingin menjalankan aplikasi ini secara mandiri di <strong>Google Apps Script / Google Spreadsheet</strong>, salin file-file kode di bawah ini ke editor script Anda!
            </p>
          </div>

          <div className="space-y-4">
            {GAS_SCRIPTS.map((script, idx) => (
              <div key={script.name} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-slate-200">
                  <div>
                    <span className="font-mono font-bold text-slate-800 text-xs">{script.name}</span>
                    <p className="text-[11px] text-slate-500">{script.description}</p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(script.code, idx)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition flex items-center gap-1 shadow-xs"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-52 leading-relaxed">
                  {script.code}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LOG AKTIVITAS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-800">Catatan Aktivitas Sistem (Log)</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">Waktu</th>
                  <th className="p-2.5">Aktivitas</th>
                  <th className="p-2.5">Detail</th>
                  <th className="p-2.5">Pengguna</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500 text-[11px]">{log.waktu}</td>
                    <td className="p-2.5 font-bold text-slate-800">{log.aktivitas}</td>
                    <td className="p-2.5 text-slate-600">{log.detail}</td>
                    <td className="p-2.5 text-slate-500 font-semibold">{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
