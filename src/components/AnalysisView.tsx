import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Info,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisResult, SentenceAnalysis, ErrorAnnotation, ErrorType } from '../types.ts';

interface AnalysisViewProps {
  result: AnalysisResult;
  originalText: string;
  onApplyCorrection: (correctedSentence: string, sentenceIndex: number) => void;
  onAskAssistant: (sentence: SentenceAnalysis, annotation?: ErrorAnnotation) => void;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  result,
  originalText,
  onApplyCorrection,
  onAskAssistant,
  onReset,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | ErrorType>('all');
  const [selectedAnnotation, setSelectedAnnotation] = useState<ErrorAnnotation | null>(null);
  const [copiedSentenceIndex, setCopiedSentenceIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  React.useEffect(() => {
    if (result.overallScore >= 85) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  }, [result.overallScore]);

  // Aggregate errors
  const allAnnotations = result.sentences.flatMap((s) => s.annotations);
  const punctuationCount = allAnnotations.filter((a) => a.type === 'punctuation').length;
  const typoCount = allAnnotations.filter((a) => a.type === 'typo').length;
  const dictionCount = allAnnotations.filter((a) => a.type === 'diction').length;

  const handleCopySentence = (textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedSentenceIndex(index);
    setTimeout(() => setCopiedSentenceIndex(null), 2000);
  };

  const handleCopyAllBaku = () => {
    const fullBaku = result.sentences.map((s) => s.improvedSentence).join(' ');
    navigator.clipboard.writeText(fullBaku);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const renderHighlightedSentence = (sentence: SentenceAnalysis) => {
    let annotationsToHighlight = sentence.annotations;
    if (activeFilter !== 'all') {
      annotationsToHighlight = annotationsToHighlight.filter((a) => a.type === activeFilter);
    }

    if (annotationsToHighlight.length === 0) {
      return <span>{sentence.original}</span>;
    }

    const sortedAnnotations = [...annotationsToHighlight].filter((a) =>
      sentence.original.includes(a.faultyText)
    );

    const parts: React.ReactNode[] = [];
    let remaining = sentence.original;

    for (let i = 0; i < sortedAnnotations.length; i++) {
      const ann = sortedAnnotations[i];
      const matchIndex = remaining.indexOf(ann.faultyText);

      if (matchIndex === -1) continue;

      if (matchIndex > 0) {
        parts.push(remaining.substring(0, matchIndex));
      }

      const isSelected = selectedAnnotation?.id === ann.id;
      let colorClass = '';

      if (ann.type === 'punctuation') {
        // Red (Tanda Baca)
        colorClass = isSelected
          ? 'bg-rose-500 text-white shadow-md'
          : 'bg-rose-500/15 text-rose-900 dark:text-rose-200 border-b-2 border-rose-500 hover:bg-rose-500/25';
      } else if (ann.type === 'typo') {
        // Yellow (Kata Tipo)
        colorClass = isSelected
          ? 'bg-amber-500 text-slate-950 shadow-md'
          : 'bg-amber-500/20 text-amber-950 dark:text-amber-200 border-b-2 border-amber-500 hover:bg-amber-500/30';
      } else {
        // Blue (Ganti Diksi)
        colorClass = isSelected
          ? 'bg-[#347899] text-white shadow-md'
          : 'bg-[#539ab7]/20 text-[#347899] dark:text-[#9cbfe5] border-b-2 border-[#539ab7] hover:bg-[#539ab7]/30';
      }

      parts.push(
        <button
          key={`${ann.id}-${i}`}
          onClick={() => setSelectedAnnotation(isSelected ? null : ann)}
          className={`inline-block mx-0.5 px-1.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer text-left ${colorClass}`}
        >
          {ann.faultyText}
        </button>
      );

      remaining = remaining.substring(matchIndex + ann.faultyText.length);
    }

    if (remaining.length > 0) {
      parts.push(remaining);
    }

    return <>{parts}</>;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Metric Card */}
      <div className="rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-[#10202e]/70 border border-[#84c1b9]/35 dark:border-[#347899]/40 p-5 sm:p-7 shadow-xl shadow-[#347899]/5 dark:shadow-none transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#84c1b9]/25 dark:border-[#347899]/35">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#347899] dark:text-[#9cbfe5]">
                Pemeriksaan Selesai
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {result.sentences.length} Kalimat Ditelaah
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Ringkasan Analisis Bahasa
            </h2>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-[#142636]/70 border border-[#84c1b9]/30 dark:border-[#347899]/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Skor Efektivitas
              </div>
              <div className="text-xl sm:text-2xl font-black tabular-nums text-slate-900 dark:text-white mt-0.5">
                {result.overallScore}%
              </div>
            </div>

            <button
              onClick={() => setActiveFilter(activeFilter === 'punctuation' ? 'all' : 'punctuation')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === 'punctuation'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md'
                  : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20 hover:border-rose-500/40'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Tanda Baca
              </div>
              <div className="text-xl font-black tabular-nums mt-0.5">
                {punctuationCount}
              </div>
            </button>

            <button
              onClick={() => setActiveFilter(activeFilter === 'typo' ? 'all' : 'typo')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === 'typo'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                  : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Kata Tipo
              </div>
              <div className="text-xl font-black tabular-nums mt-0.5">
                {typoCount}
              </div>
            </button>

            <button
              onClick={() => setActiveFilter(activeFilter === 'diction' ? 'all' : 'diction')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === 'diction'
                  ? 'bg-[#347899] text-white border-[#347899] shadow-md'
                  : 'bg-[#539ab7]/15 text-[#347899] dark:text-[#9cbfe5] border-[#539ab7]/25 hover:border-[#539ab7]/40'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Ganti Diksi
              </div>
              <div className="text-xl font-black tabular-nums mt-0.5">
                {dictionCount}
              </div>
            </button>
          </div>
        </div>

        {/* Filter Bar & Reset */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-[#142636]/90 border border-[#84c1b9]/25 dark:border-[#347899]/35">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-[#1f374d] text-[#347899] dark:text-[#9cbfe5] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Semua ({allAnnotations.length})
            </button>
            <button
              onClick={() => setActiveFilter('punctuation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'punctuation'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              Tanda Baca
            </button>
            <button
              onClick={() => setActiveFilter('typo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'typo'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              Kata Tipo
            </button>
            <button
              onClick={() => setActiveFilter('diction')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'diction'
                  ? 'bg-[#347899] text-white shadow-xs'
                  : 'text-[#347899] dark:text-[#9cbfe5] hover:bg-[#539ab7]/15'
              }`}
            >
              Ganti Diksi
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllBaku}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#347899] hover:bg-[#539ab7] text-white shadow-sm transition-all"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Tersalin!' : 'Salin Semua Baku'}</span>
            </button>

            <button
              onClick={onReset}
              className="p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Periksa Teks Baru"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Annotation Tooltip */}
        {selectedAnnotation && (
          <div className="mt-5 p-4 rounded-2xl bg-[#9cbfe5]/15 dark:bg-[#142636]/80 border border-[#539ab7]/30 dark:border-[#347899]/50 animate-in fade-in zoom-in-95 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                    selectedAnnotation.type === 'punctuation'
                      ? 'bg-rose-500 text-white'
                      : selectedAnnotation.type === 'typo'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-[#347899] text-white'
                  }`}
                >
                  {selectedAnnotation.type === 'punctuation'
                    ? 'Tanda Baca'
                    : selectedAnnotation.type === 'typo'
                    ? 'Kata Tipo'
                    : 'Ganti Diksi'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {selectedAnnotation.ruleReference}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const sentence = result.sentences.find((s) =>
                      s.annotations.some((a) => a.id === selectedAnnotation.id)
                    );
                    if (sentence) onAskAssistant(sentence, selectedAnnotation);
                  }}
                  className="flex items-center gap-1 text-xs text-[#347899] dark:text-[#9cbfe5] font-bold hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Tanya Asisten</span>
                </button>
                <button
                  onClick={() => setSelectedAnnotation(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2.5 text-sm sm:text-base">
              <span className="line-through text-rose-500 font-semibold">
                {selectedAnnotation.faultyText}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-[#347899] dark:text-[#84c1b9] font-bold bg-[#84c1b9]/15 px-2 py-0.5 rounded-md border border-[#84c1b9]/30">
                {selectedAnnotation.suggestion}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed font-normal">
              {selectedAnnotation.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Per-Sentence Cards */}
      <div className="space-y-5">
        {result.sentences.map((sentence) => {
          const isSentenceCopied = copiedSentenceIndex === sentence.index;

          return (
            <div
              key={sentence.index}
              className="rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-[#10202e]/70 border border-[#84c1b9]/35 dark:border-[#347899]/40 p-5 sm:p-6 shadow-xl shadow-[#347899]/5 dark:shadow-none transition-all"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#84c1b9]/25 dark:border-[#347899]/35">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#539ab7]/15 text-[#347899] dark:text-[#9cbfe5] font-extrabold text-xs flex items-center justify-center border border-[#539ab7]/30">
                    {sentence.index}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Kalimat {sentence.index}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      sentence.isEffective
                        ? 'bg-[#b1cd5c]/20 text-[#347899] dark:text-[#b1cd5c] border border-[#b1cd5c]/40'
                        : sentence.score >= 60
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {sentence.isEffective ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-[#53aca2]" />
                        <span>Efektif ({sentence.score}%)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>Perlu Perbaikan ({sentence.score}%)</span>
                      </>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => onAskAssistant(sentence)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#347899] dark:hover:text-[#9cbfe5] hover:bg-slate-100 dark:hover:bg-[#142636] rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#539ab7]" />
                  <span>Tanya Asisten</span>
                </button>
              </div>

              {/* Highlighted text */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-[#0a1723]/70 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Teks Asli (Interaktif)
                </div>
                <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed font-normal">
                  {renderHighlightedSentence(sentence)}
                </div>
              </div>

              {/* S-P-O-Pel-K */}
              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Struktur Sintaksis (Tata Bahasa Baku)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#142636]/50 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                    <span className="text-[10px] font-bold text-[#347899] dark:text-[#9cbfe5] uppercase">
                      Subjek (S)
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {sentence.structure.subject || 'Kabur'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#142636]/50 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                    <span className="text-[10px] font-bold text-[#347899] dark:text-[#9cbfe5] uppercase">
                      Predikat (P)
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {sentence.structure.predicate || 'Tidak Ada'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#142636]/50 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                    <span className="text-[10px] font-bold text-[#347899] dark:text-[#9cbfe5] uppercase">
                      Objek / Pelengkap
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {sentence.structure.object || sentence.structure.complement || '-'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#142636]/50 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                    <span className="text-[10px] font-bold text-[#347899] dark:text-[#9cbfe5] uppercase">
                      Keterangan (K)
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {sentence.structure.adverbial || '-'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                  {sentence.structure.analysis}
                </p>
              </div>

              {/* Ineffective Reasons */}
              {sentence.ineffectiveReasons.length > 0 && (
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Catatan Ketidakefektifan:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200/90">
                    {sentence.ineffectiveReasons.map((reason, rIdx) => (
                      <li key={rIdx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved Baku Sentence */}
              <div className="mt-4 p-4 rounded-2xl bg-[#84c1b9]/15 dark:bg-[#53aca2]/15 border border-[#84c1b9]/30 dark:border-[#53aca2]/30">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#347899] dark:text-[#84c1b9]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#53aca2]" />
                    <span>Gubahan Baku & Efektif</span>
                  </div>
                  <button
                    onClick={() => handleCopySentence(sentence.improvedSentence, sentence.index)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#347899] dark:text-[#84c1b9] bg-white/60 dark:bg-[#142636]/60 hover:bg-white dark:hover:bg-[#1f374d] transition-colors"
                  >
                    {isSentenceCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {sentence.improvedSentence}
                </div>
              </div>

              {/* Sentence Summary */}
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-2.5 border-t border-[#84c1b9]/25 dark:border-[#347899]/35">
                <Info className="w-3.5 h-3.5 text-[#539ab7] shrink-0 mt-0.5" />
                <span>{sentence.sentenceSummary}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Analysis Summary at bottom with updated redaksi */}
      <div className="rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-[#9cbfe5]/15 via-[#84c1b9]/10 to-[#b1cd5c]/10 dark:from-[#347899]/25 dark:via-[#10202e]/80 dark:to-[#53aca2]/15 border border-[#84c1b9]/35 dark:border-[#347899]/40 p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#84c1b9]/25 dark:border-[#347899]/35">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#53aca2]" />
              <span>Simpulan Analisis KOTARI</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ulasan menyeluruh berdasarkan kaidah Tata Bahasa Baku Bahasa Indonesia serta EYD V.
            </p>
          </div>

          <button
            onClick={handleCopyAllBaku}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#347899] hover:bg-[#539ab7] text-white shadow-md shadow-[#347899]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4" />
                <span>Seluruh Teks Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Seluruh Kalimat Baku</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {result.overallSummary}
        </div>
      </div>
    </div>
  );
};
