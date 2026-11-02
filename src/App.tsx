import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { ParagraphBox } from './components/ParagraphBox.tsx';
import { ScanWriting } from './components/ScanWriting.tsx';
import { AnalysisView } from './components/AnalysisView.tsx';
import { AIAssistantDrawer } from './components/AIAssistantDrawer.tsx';
import { RepositoryView } from './components/RepositoryView.tsx';
import { GuideModal } from './components/GuideModal.tsx';
import { AnalysisResult, SentenceAnalysis, ErrorAnnotation } from './types.ts';
import { getDailyQuote, LiteraryQuote } from './data/literaryQuotes.ts';
import { Sparkles, Quote, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'paragraph' | 'scan' | 'repository'>('paragraph');
  const [inputText, setInputText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Literary Quote State (Updates daily, with interactive shuffle)
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [currentQuote, setCurrentQuote] = useState<LiteraryQuote>(() => getDailyQuote());

  const handleNextQuote = () => {
    const nextIdx = quoteIndex + 1;
    setQuoteIndex(nextIdx);
    setCurrentQuote(getDailyQuote(nextIdx));
  };

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kotari_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Assistant & Guide Modals
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [activeAssistantSentence, setActiveAssistantSentence] = useState<SentenceAnalysis | null>(null);
  const [activeAssistantAnnotation, setActiveAssistantAnnotation] = useState<ErrorAnnotation | null>(null);

  // Sync dark class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kotari_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kotari_theme', 'light');
    }
  }, [isDarkMode]);

  // Execute Sentence Analysis
  const handleAnalyze = async (overrideText?: string) => {
    const textToAnalyze = overrideText || inputText;
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/kotari/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menganalisis kalimat');
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'Terjadi gangguan saat membedah kalimat. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextExtracted = (extracted: string) => {
    setInputText(extracted);
    setActiveTab('paragraph');
    handleAnalyze(extracted);
  };

  const handleApplyCorrection = (correctedSentence: string, sentenceIndex: number) => {
    if (!analysisResult) return;
    const updatedSentences = analysisResult.sentences.map((s) =>
      s.index === sentenceIndex
        ? { ...s, original: correctedSentence, isEffective: true, score: 100, annotations: [], ineffectiveReasons: [] }
        : s
    );
    setAnalysisResult({ ...analysisResult, sentences: updatedSentences });
    setInputText(updatedSentences.map((s) => s.original).join(' '));
  };

  const handleAskAssistant = (sentence: SentenceAnalysis, annotation?: ErrorAnnotation) => {
    setActiveAssistantSentence(sentence);
    setActiveAssistantAnnotation(annotation || null);
    setIsAssistantOpen(true);
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const formattedToday = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8fbfa] dark:bg-[#09131d] text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-[#539ab7] selection:text-white relative overflow-x-hidden">
      {/* Dynamic atmospheric mesh gradients using KOTARI palette: #9cbfe5, #539ab7, #84c1b9, #b1cd5c, #347899, #53aca2 */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] max-w-full h-[450px] bg-gradient-to-b from-[#9cbfe5]/25 via-[#84c1b9]/15 to-transparent dark:from-[#347899]/30 dark:via-[#53aca2]/15 dark:to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-[35%] -left-36 w-80 h-80 bg-[#539ab7]/15 dark:bg-[#347899]/20 rounded-full blur-3xl" />
        <div className="absolute top-[55%] -right-36 w-80 h-80 bg-[#b1cd5c]/10 dark:bg-[#53aca2]/15 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'paragraph') setAnalysisError(null);
        }}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isAssistantOpen={isAssistantOpen}
      />

      {/* Main Content Viewport (Adaptive to all screen aspect ratios) */}
      <main className="relative z-10 flex-1 w-full max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col justify-start">
        {/* Hero Section if on Paragraph tab and no analysis yet */}
        {activeTab === 'paragraph' && !analysisResult && (
          <div className="mb-6 sm:mb-8 text-center max-w-3xl mx-auto w-full">
            {/* Kicker badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#347899] dark:text-[#9cbfe5] bg-[#9cbfe5]/15 dark:bg-[#347899]/25 border border-[#539ab7]/30 dark:border-[#539ab7]/40 mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#b1cd5c]" />
              <span>Deteksi Kalimat Tidak Efektif & Kosakata Tidak Baku</span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Koreksi Kalimat Bahasa Indonesia
            </h1>

            {/* Subtitle with user-requested accents & highlights */}
            <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 mt-3 sm:mt-4 leading-relaxed max-w-2xl mx-auto">
              Uji{' '}
              <mark className="bg-[#b1cd5c]/35 dark:bg-[#b1cd5c]/30 text-slate-900 dark:text-[#b1cd5c] px-1.5 py-0.5 rounded-md font-bold border-b-2 border-[#b1cd5c]">
                kemampuan menulis
              </mark>{' '}
              bahasa Indonesiamu di sini!{' '}
              <s className="line-through decoration-rose-500 decoration-2 text-slate-400 dark:text-slate-500 font-normal">
                Kamu bisa
              </s>{' '}
              manfaatkan kotak dialog di bawah ini dengan sekurang-kurangnya 2 niat, yakni niat untuk belajar{' '}
              <strong className="font-bold text-slate-900 dark:text-white">
                (dari tidak tahu menjadi tahu)
              </strong>{' '}
              atau niat untuk{' '}
              <mark className="bg-rose-500/20 dark:bg-rose-500/30 text-rose-900 dark:text-rose-200 px-1.5 py-0.5 rounded-md font-bold border-b-2 border-rose-500">
                menguji diri
              </mark>{' '}
              (dari mengerti menjadi melaksanakan).
            </p>

            {/* Daily Literary Quote Card with Handwriting Font (Amsterdam Two style) */}
            <div className="mt-5 sm:mt-7 p-4 sm:p-5 rounded-3xl backdrop-blur-xl bg-white/75 dark:bg-[#10202e]/70 border border-[#84c1b9]/35 dark:border-[#347899]/40 shadow-xl shadow-[#347899]/5 dark:shadow-none text-left relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 inset-y-0 bg-gradient-to-b from-[#347899] via-[#53aca2] to-[#b1cd5c]" />

              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#84c1b9]/25 dark:border-[#347899]/35">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#347899] dark:text-[#9cbfe5]">
                  <Quote className="w-3.5 h-3.5 text-[#53aca2]" />
                  <span>Kutipan Sastra Hari Ini · {formattedToday}</span>
                </div>

                <button
                  onClick={handleNextQuote}
                  title="Ganti Kutipan Sastra"
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#347899] dark:hover:text-[#84c1b9] transition-colors p-1"
                >
                  <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="hidden xs:inline">Kutipan Lain</span>
                </button>
              </div>

              {/* Handwriting font for quote body */}
              <blockquote className="mt-3 text-lg sm:text-2xl font-handwriting font-semibold text-slate-800 dark:text-slate-100 leading-snug pl-2 tracking-wide">
                "{currentQuote.quote}"
              </blockquote>

              <div className="mt-2 text-right text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                — <span className="text-slate-900 dark:text-slate-200 font-bold">{currentQuote.author}</span>,{' '}
                <em className="text-[#347899] dark:text-[#84c1b9] font-medium">{currentQuote.work}</em>
                {currentQuote.year && <span> ({currentQuote.year})</span>}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Kotak Paragraf & Hasil Analisis */}
        {activeTab === 'paragraph' && (
          <div className="space-y-6 w-full">
            {!analysisResult ? (
              <ParagraphBox
                text={inputText}
                setText={setInputText}
                onAnalyze={() => handleAnalyze()}
                isLoading={isLoading}
                onClear={() => {
                  setInputText('');
                  setAnalysisResult(null);
                  setAnalysisError(null);
                }}
              />
            ) : (
              <AnalysisView
                result={analysisResult}
                originalText={inputText}
                onApplyCorrection={handleApplyCorrection}
                onAskAssistant={handleAskAssistant}
                onReset={handleResetAnalysis}
              />
            )}

            {analysisError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
                <span>{analysisError}</span>
                <button
                  onClick={() => handleAnalyze()}
                  className="px-4 py-1.5 rounded-xl bg-[#347899] text-white font-bold text-xs hover:bg-[#539ab7] shrink-0 shadow-sm"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pindai Tulisan (Kamera Live & Galeri) */}
        {activeTab === 'scan' && (
          <div className="max-w-3xl mx-auto w-full">
            <ScanWriting onTextExtracted={handleTextExtracted} />
          </div>
        )}

        {/* Tab 3: Repositoriku (Pangkalan Kosakata) */}
        {activeTab === 'repository' && <RepositoryView />}
      </main>

      {/* AI Assistant Drawer Panel (Fully responsive sheet on mobile) */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setActiveAssistantSentence(null);
          setActiveAssistantAnnotation(null);
        }}
        currentText={inputText}
        activeSentence={activeAssistantSentence}
        activeAnnotation={activeAssistantAnnotation}
      />

      {/* Comprehensive Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Footer updated per user brief */}
      <footer className="mt-auto border-t border-[#84c1b9]/25 dark:border-[#347899]/30 backdrop-blur-xl bg-white/50 dark:bg-[#0c1924]/60 py-5 text-xs text-slate-500 dark:text-slate-400 transition-colors z-10">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">KOTARI</span>
            <span>·</span>
            <span>Koreksi Kosakata Hari Ini</span>
            <span>·</span>
            <span className="text-[#347899] dark:text-[#84c1b9] font-medium">
              digagas oleh Pak Dirjen dieksekusi oleh Google AI Studio
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
