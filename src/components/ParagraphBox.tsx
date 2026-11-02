import React, { useState, useMemo } from 'react';
import { Sparkles, Trash2, ArrowRight, AlertCircle, FileText, ChevronDown } from 'lucide-react';

interface ParagraphBoxProps {
  text: string;
  setText: (val: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onClear: () => void;
}

const SAMPLE_PRESETS = [
  {
    title: 'Surat Dinas & Pleonasme',
    desc: 'Pemborosan kata & konjungsi intrakalimat',
    text: 'Kepada para bapak-bapak dan ibu-ibu sekalian, kami sangat menghaturkan banyak terima kasih. Untuk mempersingkat waktu acara segera dimulai. Sehingga hasil daripada rapat dapat segera ditindak lanjuti. Dimana para hadirin dimohon tertib.',
  },
  {
    title: 'Karya Ilmiah Cacat Subjek',
    desc: 'Preposisi mengaburkan subjek & pleonasme',
    text: 'Bagi mahasiswa yang mana belum mengumpulkan tugas agar supaya segera menyerahkan ke dosen pembimbing. Berdasarkan hasil penelitian membuktikan bahwa sistem ini sangat efektif sekali. Meskipun demikian tetapi masih terdapat kendala teknis.',
  },
  {
    title: 'SK EYD V & Tanda Baca',
    desc: 'Bentuk terikat, huruf kapital & koma',
    text: 'Pada hari senin yang lalu saya pergi ke luar kota bersama Paman. Kami membeli jeruk bali, kunci inggris dan satai madura di pasar. Dr. Anton mengatakan bahwa pasca operasi pasien harus istirahat total.',
  },
];

export const ParagraphBox: React.FC<ParagraphBoxProps> = ({
  text,
  setText,
  onAnalyze,
  isLoading,
  onClear,
}) => {
  const [showPresets, setShowPresets] = useState(false);

  // Split and count sentences
  const sentenceCount = useMemo(() => {
    if (!text.trim()) return 0;
    const rawSentences = text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return rawSentences.length;
  }, [text]);

  const isOverLimit = sentenceCount > 5;
  const isInputEmpty = !text.trim();

  return (
    <div className="relative rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-[#10202e]/70 border border-[#84c1b9]/35 dark:border-[#347899]/40 p-4 sm:p-7 shadow-xl shadow-[#347899]/5 dark:shadow-none transition-all">
      {/* Decorative subtle ambient lights */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#9cbfe5]/15 dark:bg-[#347899]/20 blur-3xl -z-10" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#84c1b9]/15 dark:bg-[#53aca2]/15 blur-3xl -z-10" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#84c1b9]/25 dark:border-[#347899]/35">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Kotak Paragraf
            </h2>
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full tabular-nums border transition-all ${
                isOverLimit
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : sentenceCount === 5
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : sentenceCount > 0
                  ? 'bg-[#539ab7]/15 text-[#347899] dark:text-[#9cbfe5] border-[#539ab7]/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOverLimit ? 'bg-rose-500' : 'bg-[#53aca2]'}`} />
              <span>{sentenceCount}/5 Kalimat</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maksimal 5 kalimat dalam sekali telaah untuk presisi analisis sintaksis dan ejaan.
          </p>
        </div>

        {/* Action Presets & Reset */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-[#152a3d]/90 hover:bg-slate-200/90 dark:hover:bg-[#1f3b54] border border-[#84c1b9]/30 dark:border-[#347899]/40 transition-all min-h-[38px]"
            >
              <FileText className="w-3.5 h-3.5 text-[#539ab7]" />
              <span>Muat Contoh</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPresets && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white/95 dark:bg-[#10202e]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#84c1b9]/35 dark:border-[#347899]/50 p-2 z-30 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                  Pilih Contoh Uji
                </div>
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setText(preset.text);
                      setShowPresets(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl text-xs hover:bg-[#9cbfe5]/15 dark:hover:bg-[#1c354c] transition-colors group"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#347899] dark:group-hover:text-[#9cbfe5]">
                      {preset.title}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {text && (
            <button
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Bersihkan Teks"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="mt-4 relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tuliskan atau tempel kalimat Anda di sini (maksimal 5 kalimat)... Contoh: 'Bagi seluruh para mahasiswa agar supaya mengumpulkan laporan sebelum batas waktu.'"
          rows={5}
          className={`w-full p-4 sm:p-5 text-sm sm:text-base leading-relaxed rounded-2xl border bg-slate-50/70 dark:bg-[#0a1723]/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all resize-y min-h-[140px] ${
            isOverLimit
              ? 'border-rose-500/60 focus:ring-4 focus:ring-rose-500/10'
              : 'border-[#84c1b9]/40 dark:border-[#347899]/50 focus:border-[#539ab7] focus:ring-4 focus:ring-[#539ab7]/15'
          }`}
        />

        {/* Counter & Warning Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 dark:text-slate-500 mt-2.5 px-1">
          <div>
            {isOverLimit ? (
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Kapasitas melebihi batas 5 kalimat. Mohon kurangi agar telaah akurat.
              </span>
            ) : (
              <span>Tekan tombol di bawah untuk memeriksa keefektifan kalimat.</span>
            )}
          </div>
          <div className="tabular-nums font-mono text-[11px] self-end sm:self-auto">
            {text.length} karakter · {sentenceCount} kalimat
          </div>
        </div>
      </div>

      {/* Footer Controls & Legend */}
      <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-5 border-t border-[#84c1b9]/25 dark:border-[#347899]/35">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Penandaan:
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 font-medium border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Tanda Baca (Merah)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Kata Tipo (Kuning)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Ganti Diksi (Biru)
          </span>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isInputEmpty || isOverLimit || isLoading}
          className={`w-full md:w-auto px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg min-h-[48px] transition-all ${
            isInputEmpty || isOverLimit || isLoading
              ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#347899] to-[#539ab7] hover:from-[#539ab7] hover:to-[#53aca2] text-white shadow-[#347899]/25 hover:shadow-[#347899]/35 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Membedah Kalimat...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#b1cd5c]" />
              <span>Analisis Keefektifan Kalimat</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
