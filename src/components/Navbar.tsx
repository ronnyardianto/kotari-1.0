import React from 'react';
import { Sparkles, Moon, Sun, BookOpen, Camera, Edit3, Bookmark } from 'lucide-react';

interface NavbarProps {
  activeTab: 'paragraph' | 'scan' | 'repository';
  setActiveTab: (tab: 'paragraph' | 'scan' | 'repository') => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenAssistant: () => void;
  onOpenGuide: () => void;
  isAssistantOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onOpenAssistant,
  onOpenGuide,
  isAssistantOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0c1924]/85 border-b border-[#84c1b9]/30 dark:border-[#347899]/30 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Zone - Real KOTARI Logo from attachment */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('paragraph')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md shadow-[#347899]/20 ring-1 ring-[#539ab7]/40 group-hover:scale-105 transition-transform bg-[#347899]">
                <img
                  src="/assets/aistudio/KOTARI_a466f6ed.png"
                  alt="Logo KOTARI"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  KOTARI
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#539ab7] dark:text-[#84c1b9] mt-0.5 leading-none">
                  Koreksi Kosakata Hari Ini
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Segmented Controls (Fluidly adaptive across screen sizes) */}
          <nav className="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-[#132333]/90 border border-[#84c1b9]/25 dark:border-[#347899]/40 shadow-inner">
            <button
              onClick={() => setActiveTab('paragraph')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all min-h-[36px] ${
                activeTab === 'paragraph'
                  ? 'bg-white dark:bg-[#1f364d] text-[#347899] dark:text-[#9cbfe5] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline whitespace-nowrap">Kotak Paragraf</span>
              <span className="xs:hidden whitespace-nowrap">Paragraf</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all min-h-[36px] ${
                activeTab === 'scan'
                  ? 'bg-white dark:bg-[#1f364d] text-[#347899] dark:text-[#9cbfe5] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline whitespace-nowrap">Pindai Tulisan</span>
              <span className="xs:hidden whitespace-nowrap">Pindai</span>
            </button>

            <button
              onClick={() => setActiveTab('repository')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all min-h-[36px] ${
                activeTab === 'repository'
                  ? 'bg-white dark:bg-[#1f364d] text-[#347899] dark:text-[#9cbfe5] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Repositoriku</span>
              <span className="sm:hidden whitespace-nowrap">Koleksi</span>
            </button>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenGuide}
              title="Panduan EYD V & Tata Bahasa Baku"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#347899] dark:hover:text-[#84c1b9] bg-white/60 dark:bg-[#132333]/60 hover:bg-slate-100 dark:hover:bg-[#1f364d] border border-[#84c1b9]/30 dark:border-[#347899]/40 shadow-xs transition-colors min-h-[38px]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#539ab7]" />
              <span>Panduan</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
              className="p-2 sm:p-2.5 rounded-xl border border-[#84c1b9]/30 dark:border-[#347899]/40 bg-white/60 dark:bg-[#132333]/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f364d] transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#b1cd5c]" /> : <Moon className="w-4 h-4 text-[#347899]" />}
            </button>

            <button
              onClick={onOpenAssistant}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all min-h-[38px] ${
                isAssistantOpen
                  ? 'bg-[#347899] text-white ring-2 ring-[#84c1b9]/50 shadow-[#347899]/30'
                  : 'bg-[#347899] hover:bg-[#539ab7] text-white dark:bg-[#347899] dark:hover:bg-[#53aca2] shadow-[#347899]/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b1cd5c] animate-pulse" />
              <span className="whitespace-nowrap">Asisten AI</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
