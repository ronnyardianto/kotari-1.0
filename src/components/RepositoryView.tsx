import React, { useState, useMemo, useRef } from 'react';
import {
  Bookmark,
  Plus,
  Search,
  Download,
  Upload,
  Star,
  Trash2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { VocabularyItem, WordClass, WordCategory } from '../types.ts';
import {
  loadVocabulary,
  addVocabularyItem,
  deleteVocabularyItem,
  toggleFavoriteVocabulary,
  exportVocabularyJSON,
  importVocabularyJSON,
} from '../utils/storage.ts';

export const RepositoryView: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabularyItem[]>(() => loadVocabulary());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPOS, setSelectedPOS] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // New Word Form State
  const [newWord, setNewWord] = useState('');
  const [newPOS, setNewPOS] = useState<WordClass>('Nomina');
  const [newDef, setNewDef] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newCategory, setNewCategory] = useState<WordCategory>('Tambahan Pengguna');
  const [newNotes, setNewNotes] = useState('');

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered List
  const filteredList = useMemo(() => {
    return vocabList.filter((item) => {
      const matchesSearch =
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || item.sourceCategory === selectedCategory;
      const matchesPOS = selectedPOS === 'all' || item.partOfSpeech === selectedPOS;
      const matchesFav = !onlyFavorites || item.isFavorite;

      return matchesSearch && matchesCat && matchesPOS && matchesFav;
    });
  }, [vocabList, searchQuery, selectedCategory, selectedPOS, onlyFavorites]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newDef.trim()) return;

    addVocabularyItem({
      word: newWord.trim(),
      partOfSpeech: newPOS,
      definition: newDef.trim(),
      exampleSentence: newExample.trim(),
      sourceCategory: newCategory,
      notes: newNotes.trim(),
    });

    setVocabList(loadVocabulary());
    setIsAddModalOpen(false);

    setNewWord('');
    setNewDef('');
    setNewExample('');
    setNewNotes('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus kosakata ini dari Repositoriku?')) {
      const updated = deleteVocabularyItem(id);
      setVocabList(updated);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteVocabulary(id);
    setVocabList(updated);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importVocabularyJSON(content);
      if (res.success) {
        setVocabList(loadVocabulary());
        setImportNotification(`Berhasil mengimpor ${res.count} kosakata baru ke repositori!`);
      } else {
        setImportNotification(`Gagal mengimpor: ${res.error}`);
      }
      setTimeout(() => setImportNotification(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const QUIZ_QUESTIONS = [
    {
      question: 'Manakah bentuk kata baku sesuai SK EYD V?',
      options: ['Praktik', 'Praktek'],
      correct: 0,
      explanation: 'Baku: praktik (diserap dari practice/praktijk), diserap dengan huruf i.',
    },
    {
      question: 'Manakah bentuk kata baku sesuai SK EYD V?',
      options: ['Analisa', 'Analisis'],
      correct: 1,
      explanation: 'Baku: analisis (akhiran -sis). Analisa adalah bentuk tidak baku.',
    },
    {
      question: 'Manakah bentuk kata baku sesuai SK EYD V?',
      options: ['Pascapanen', 'Pasca panen'],
      correct: 0,
      explanation: 'Bentuk terikat "pasca-" ditulis serangkai tanpa spasi (pascapanen).',
    },
    {
      question: 'Manakah bentuk kata baku sesuai SK EYD V?',
      options: ['Kwalitas', 'Kualitas'],
      correct: 1,
      explanation: 'Konsonan ganda qu- menjadi ku- dalam bahasa Indonesia (kualitas).',
    },
    {
      question: 'Manakah bentuk kata baku sesuai SK EYD V?',
      options: ['Acapkali', 'Acap kali'],
      correct: 0,
      explanation: 'SK EYD V menetapkan "acapkali" ditulis serangkai.',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner */}
      <div className="rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 shadow-xl shadow-indigo-950/5 dark:shadow-none transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Pangkalan Kosakata Mandiri
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {vocabList.length} Lema Terdaftar
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Repositoriku
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Himpun dan perkaya kosakata bahasa Indonesia. Basis data Anda tersimpan lokal di perangkat dan dapat dicadangkan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 min-h-[38px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Kuis Diksi</span>
            </button>

            <button
              onClick={exportVocabularyJSON}
              title="Unduh seluruh basis data kosakata ke format JSON"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 min-h-[38px]"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Ekspor JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Unggah berkas JSON kosakata"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 min-h-[38px]"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Impor JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kata</span>
            </button>
          </div>
        </div>

        {importNotification && (
          <div className="mt-4 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importNotification}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="mt-4 flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lema kata, definisi, atau catatan kaidah..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 min-h-[40px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none min-h-[40px]"
            >
              <option value="all">Semua Kategori</option>
              <option value="EYD V">SK EYD V 2022</option>
              <option value="Kata Baku">Kata Baku Utama</option>
              <option value="Kata Serapan">Unsur Serapan</option>
              <option value="Tambahan Pengguna">Tambahan Saya</option>
            </select>

            <select
              value={selectedPOS}
              onChange={(e) => setSelectedPOS(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none min-h-[40px]"
            >
              <option value="all">Semua Kelas Kata</option>
              <option value="Nomina">Nomina (Benda)</option>
              <option value="Verba">Verba (Kerja)</option>
              <option value="Adjektiva">Adjektiva (Sifat)</option>
              <option value="Adverbia">Adverbia (Keterangan)</option>
              <option value="Konjungsi">Konjungsi</option>
            </select>

            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`p-2 rounded-xl border text-xs flex items-center justify-center transition-colors min-h-[40px] min-w-[40px] ${
                onlyFavorites
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200/80 dark:border-slate-700/80 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Hanya Tampilkan Favorit"
            >
              <Star
                className={`w-4 h-4 ${
                  onlyFavorites ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-8">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Tidak ada kosakata yang cocok
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau tambahkan kata baru ke repositori Anda.
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-lg shadow-indigo-950/5 dark:shadow-none hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{item.word}</span>
                      <span className="text-[11px] font-medium text-slate-400 italic">
                        ({item.partOfSpeech})
                      </span>
                    </h3>
                    <span className="inline-block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md mt-1 border border-indigo-500/15">
                      {item.sourceCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-amber-500"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isFavorite
                            ? 'fill-amber-400 text-amber-500'
                            : 'hover:fill-slate-300'
                        }`}
                      />
                    </button>
                    {item.sourceCategory === 'Tambahan Pengguna' && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                        title="Hapus kata"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 leading-relaxed">
                  {item.definition}
                </p>

                {item.exampleSentence && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 italic border-l-2 border-indigo-500">
                    "{item.exampleSentence}"
                  </div>
                )}
              </div>

              {item.notes && (
                <div className="mt-4 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Catatan:</span>{' '}
                  {item.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Tambah Kosakata Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                <span>Tambah Kosakata Baru</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata / Lema Baku *
                </label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Contoh: swafoto, narahubung, gawai"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas Kata *
                  </label>
                  <select
                    value={newPOS}
                    onChange={(e) => setNewPOS(e.target.value as WordClass)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Nomina">Nomina (Benda)</option>
                    <option value="Verba">Verba (Kerja)</option>
                    <option value="Adjektiva">Adjektiva (Sifat)</option>
                    <option value="Adverbia">Adverbia (Keterangan)</option>
                    <option value="Konjungsi">Konjungsi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Sumber
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as WordCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Tambahan Pengguna">Tambahan Saya</option>
                    <option value="Kata Baku">Kata Baku</option>
                    <option value="Kata Serapan">Unsur Serapan</option>
                    <option value="EYD V">SK EYD V 2022</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Definisi / Arti Kata *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newDef}
                  onChange={(e) => setNewDef(e.target.value)}
                  placeholder="Makna kata dalam bahasa Indonesia..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contoh Penggunaan dalam Kalimat
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Contoh kalimat yang efektif..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Kaidah Ejaan (Opsional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Contoh: ditulis serangkai, bentuk tidak baku: ..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Simpan ke Repositori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Kuis Diksi EYD */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Kuis Latihan Diksi EYD V</span>
              </h3>
              <button
                onClick={() => {
                  setIsQuizModalOpen(false);
                  setQuizIndex(0);
                  setQuizScore(0);
                  setQuizAnswered(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Soal {quizIndex + 1} dari {QUIZ_QUESTIONS.length}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Skor: {quizScore}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-sm font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60">
                {QUIZ_QUESTIONS[quizIndex].question}
              </div>

              <div className="mt-4 space-y-2">
                {QUIZ_QUESTIONS[quizIndex].options.map((opt, oIdx) => {
                  const isCorrect = oIdx === QUIZ_QUESTIONS[quizIndex].correct;
                  const isSelected = quizAnswered === oIdx;

                  let btnStyle = 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';
                  if (quizAnswered !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={quizAnswered !== null}
                      onClick={() => {
                        setQuizAnswered(oIdx);
                        if (isCorrect) setQuizScore((prev) => prev + 20);
                      }}
                      className={`w-full p-3 text-xs sm:text-sm font-bold rounded-xl border text-left transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizAnswered !== null && (
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Penjelasan:</span> {QUIZ_QUESTIONS[quizIndex].explanation}
                  <div className="mt-3 text-right">
                    {quizIndex < QUIZ_QUESTIONS.length - 1 ? (
                      <button
                        onClick={() => {
                          setQuizIndex((prev) => prev + 1);
                          setQuizAnswered(null);
                        }}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      >
                        Soal Berikutnya
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsQuizModalOpen(false);
                          setQuizIndex(0);
                          setQuizScore(0);
                          setQuizAnswered(null);
                        }}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      >
                        Selesai Kuis
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
