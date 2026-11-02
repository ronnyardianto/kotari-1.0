import React, { useState } from 'react';
import { X, BookOpen, Layers } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'eyd' | 'tatabahasa'>('eyd');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white/95 dark:bg-[#0c1824]/95 backdrop-blur-2xl rounded-3xl border border-[#84c1b9]/35 dark:border-[#347899]/40 max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#84c1b9]/25 dark:border-[#347899]/35 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#539ab7]/15 text-[#347899] dark:text-[#9cbfe5] flex items-center justify-center border border-[#539ab7]/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pedoman Kaidah Kebahasaan KOTARI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Berdasarkan SK EYD Edisi V (2022) & Tata Bahasa Baku Bahasa Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#142636]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-5 pt-3 border-b border-[#84c1b9]/20 dark:border-[#347899]/30 flex gap-2">
          <button
            onClick={() => setActiveSection('eyd')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeSection === 'eyd'
                ? 'border-[#347899] text-[#347899] dark:border-[#84c1b9] dark:text-[#84c1b9]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Pedoman SK EYD V (2022)
          </button>

          <button
            onClick={() => setActiveSection('tatabahasa')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeSection === 'tatabahasa'
                ? 'border-[#347899] text-[#347899] dark:border-[#84c1b9] dark:text-[#84c1b9]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Prinsip Kalimat Efektif (Tata Bahasa Baku)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeSection === 'eyd' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#9cbfe5]/15 dark:bg-[#142636]/60 border border-[#84c1b9]/30 dark:border-[#347899]/40">
                <div className="font-bold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider">
                  Sistem Penandaan 3 Warna KOTARI:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 text-xs">
                    <span className="font-bold">🔴 Merah:</span> Tanda baca (koma, titik, tanda petik) dan huruf kapital.
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs">
                    <span className="font-bold">🟡 Kuning:</span> Kata tipo, kata nonbaku, serapan keliru, dan bentuk terikat.
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#539ab7]/15 border border-[#539ab7]/25 text-[#347899] dark:text-[#9cbfe5] text-xs">
                    <span className="font-bold">🔵 Biru:</span> Rekomendasi diksi, kalimat tidak efektif, pleonasme, dan struktur rancu.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Kaidah Tanda Baca Kritis (SK EYD Bab III)
                </h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>Tanda Koma sebelum Konjungsi Pertentangan:</strong> Wajib diletakkan sebelum <em>tetapi</em>, <em>melainkan</em>, dan <em>sedangkan</em>.
                    <br />
                    <span className="text-[#53aca2] ml-4 font-mono text-xs">✓ "Saya ingin pergi, tetapi hari hujan."</span>
                  </li>
                  <li>
                    <strong>Anak Kalimat Mendahului Induk:</strong> Dipisahkan tanda koma jika anak kalimat berada di depan.
                    <br />
                    <span className="text-[#53aca2] ml-4 font-mono text-xs">✓ "Karena rajin belajar, dia lulus ujian."</span>
                  </li>
                  <li>
                    <strong>Konjungsi Antarkalimat:</strong> Wajib diikuti tanda koma: <em>Oleh karena itu,</em> <em>Namun,</em> <em>Jadi,</em> <em>Dengan demikian,</em>.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Kaidah Bentuk Terikat & Partikel (SK EYD Bab II)
                </h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>Bentuk Terikat (antar-, pasca-, sub-, multi-, pra-):</strong> Ditulis serangkai tanpa spasi.
                    <br />
                    <span className="text-[#53aca2] ml-4 font-mono text-xs">✓ pascapanen, antarsiswa, subbagian, swadaya</span>
                    <br />
                    <span className="text-slate-500 ml-4 text-xs">Kecuali diikuti huruf kapital: <em>pasca-Orba</em>, <em>anti-PKI</em>.</span>
                  </li>
                  <li>
                    <strong>Partikel 'pun':</strong> Ditulis terpisah jika bermakna 'juga' (<em>apa pun</em>, <em>siapa pun</em>, <em>sekali pun</em>). Ditulis serangkai hanya pada konjungsi baku (<em>walaupun</em>, <em>meskipun</em>, <em>kendatipun</em>, <em>bagaimanapun</em>, <em>ataupun</em>).
                  </li>
                  <li>
                    <strong>Kata Depan vs Awalan:</strong> Kata depan <em>di</em> (tempat/arah) dipisah (<em>di sekolah</em>, <em>di rumah</em>). Awalan <em>di-</em> (kata kerja pasif) ditulis serangkai (<em>dibaca</em>, <em>ditulis</em>).
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 mb-2">
                  <Layers className="w-4 h-4 text-[#539ab7]" />
                  Pilar Utama Kalimat Efektif Bahasa Indonesia
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Menurut buku <em>Tata Bahasa Baku Bahasa Indonesia</em> (Bab IX & X), kalimat efektif adalah kalimat yang mampu menyampaikan gagasan secara tepat, hemat, logis, dan utuh.
                </p>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#142636]/50 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">1. Kesepadanan Struktur (Subjek & Predikat Jelas)</span>
                    <p className="text-xs mt-1">
                      Kalimat wajib memiliki minimal Subjek (S) dan Predikat (P) yang jelas. Jangan menaruh preposisi (<em>Bagi</em>, <em>Untuk</em>, <em>Dalam</em>, <em>Tentang</em>) di awal yang menenggelamkan subjek.
                    </p>
                    <div className="text-xs mt-1.5 font-mono">
                      <span className="text-rose-500">✗ Bagi semua siswa harus hadir tepat waktu.</span>
                      <br />
                      <span className="text-[#53aca2]">✓ Semua siswa harus hadir tepat waktu.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#142636]/50 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">2. Kehematan Kata (Menghindari Pleonasme)</span>
                    <p className="text-xs mt-1">
                      Hindari penggabungan kata yang memiliki arti sama secara berlebihan:
                    </p>
                    <div className="text-xs mt-1.5 font-mono">
                      <span className="text-rose-500">✗ agar supaya, adalah merupakan, sejak dari, para hadirin sekalian</span>
                      <br />
                      <span className="text-[#53aca2]">✓ agar, merupakan, sejak, hadirin</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#142636]/50 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">3. Kesejajaran Bentuk (Paralelisme)</span>
                    <p className="text-xs mt-1">
                      Jika perincian pertama berbentuk verba berawalan <em>me-</em>, perincian selanjutnya wajib berawalan <em>me-</em>.
                    </p>
                    <div className="text-xs mt-1.5 font-mono">
                      <span className="text-rose-500">✗ Tugasnya meliputi menyusun rencana dan pembuatan laporan.</span>
                      <br />
                      <span className="text-[#53aca2]">✓ Tugasnya meliputi menyusun rencana dan membuat laporan.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#142636]/50 border border-[#84c1b9]/25 dark:border-[#347899]/35">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">4. Larangan Konjungsi Intrakalimat di Awal Kalimat Mandiri</span>
                    <p className="text-xs mt-1">
                      Kata hubung subordinatif seperti <em>sehingga</em>, <em>karena</em>, <em>sedangkan</em> tidak boleh mengawali kalimat tunggal yang terpisah tanda titik dari induk kalimatnya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#84c1b9]/25 dark:border-[#347899]/35 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#347899] hover:bg-[#539ab7] text-white rounded-xl shadow-xs transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
