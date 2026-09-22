import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Settings, 
  UserCheck, 
  Layers, 
  HelpCircle,
  FileText,
  Database
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onOpenQuickGen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onOpenQuickGen,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md border-b border-emerald-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600 border border-emerald-400 flex items-center justify-center shadow-inner text-white font-bold text-xl">
              MI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white drop-shadow-sm">
                  AI GENERATOR SOAL MI
                </span>
                <span className="hidden sm:inline-block text-[11px] bg-emerald-600/80 text-emerald-100 font-medium px-2 py-0.5 rounded-full border border-emerald-400/40">
                  v2.6 Kemenag
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 font-medium tracking-wide">
                Kreatif by Witno • Asesmen Madrasah Ibtidaiyah
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              id="nav-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-900 text-white font-semibold' 
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              id="nav-btn-generator"
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'generator' 
                  ? 'bg-emerald-900 text-white font-semibold' 
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generator Soal</span>
            </button>
            <button
              id="nav-btn-kisikisi"
              onClick={() => setActiveTab('kisikisi')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'kisikisi' 
                  ? 'bg-emerald-900 text-white font-semibold' 
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kisi-Kisi</span>
            </button>
            <button
              id="nav-btn-banksoal"
              onClick={() => setActiveTab('banksoal')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'banksoal' 
                  ? 'bg-emerald-900 text-white font-semibold' 
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Bank Soal</span>
            </button>
            <button
              id="nav-btn-naskah"
              onClick={() => setActiveTab('naskah')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'naskah' 
                  ? 'bg-emerald-900 text-white font-semibold' 
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Naskah & Cetak</span>
            </button>
            <button
              id="nav-btn-pengaturan"
              onClick={() => setActiveTab('pengaturan')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'pengaturan' 
                  ? 'bg-emerald-900 text-white font-semibold' 
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </nav>

          {/* Right Action: Quick Generate + Role Selector */}
          <div className="flex items-center gap-2">
            <button
              id="btn-quick-generate-nav"
              onClick={onOpenQuickGen}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-md shadow-sm transition flex items-center gap-1.5 active:scale-95"
              title="Buat soal instan dalam 1 klik"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span> Cepat
            </button>

            {/* Role Simulator Pill */}
            <div className="flex items-center bg-emerald-950/60 rounded-lg p-1 border border-emerald-700/60 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-300 ml-1 mr-1.5 hidden sm:block" />
              <select
                id="select-user-role"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-emerald-100 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                title="Beralih peran pengguna untuk simulasi akses"
              >
                <option value="GURU" className="bg-slate-800 text-white">Guru MI</option>
                <option value="ADMIN" className="bg-slate-800 text-white">Admin</option>
                <option value="KEPALA_MADRASAH" className="bg-slate-800 text-white">Kepala Madrasah</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const BottomNav: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickGen: () => void;
}> = ({ activeTab, setActiveTab, onOpenQuickGen }) => {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: Layers },
    { id: 'generator', label: 'Generator', icon: Sparkles, highlight: true },
    { id: 'kisikisi', label: 'Kisi-Kisi', icon: BookOpen },
    { id: 'banksoal', label: 'Bank Soal', icon: Database },
    { id: 'naskah', label: 'Naskah', icon: FileText },
    { id: 'pengaturan', label: 'Setelan', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl py-1 px-2 safe-area-pb">
      <div className="grid grid-cols-6 gap-0.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`bottom-nav-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition active:scale-95 ${
                isActive
                  ? 'text-emerald-700 font-bold bg-emerald-50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${t.highlight && !isActive ? 'text-amber-500' : ''}`} />
                {t.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-tight truncate max-w-full">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
