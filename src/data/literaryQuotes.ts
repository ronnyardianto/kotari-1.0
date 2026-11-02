export interface LiteraryQuote {
  id: string;
  quote: string;
  author: string;
  work: string;
  year?: string;
}

export const LITERARY_QUOTES: LiteraryQuote[] = [
  {
    id: 'quote-1',
    quote: 'Kematianku tak lebih dari seperti saat seorang penyair menuliskan tanda titik pada akhir kalimat sajaknya.',
    author: 'Leila S. Chudori',
    work: 'Laut Bercerita',
    year: '2017',
  },
  {
    id: 'quote-2',
    quote: 'Seorang terpelajar harus sudah berbuat adil sejak dalam pikiran apalagi dalam perbuatan.',
    author: 'Pramoedya Ananta Toer',
    work: 'Bumi Manusia',
    year: '1980',
  },
  {
    id: 'quote-3',
    quote: 'Yang fana adalah waktu. Kita abadi: memungut detik demi detik, merangkainya seperti bunga sampai pada suatu hari kita lupa untuk apa.',
    author: 'Sapardi Djoko Damono',
    work: 'Hujan Bulan Juni',
    year: '1989',
  },
  {
    id: 'quote-4',
    quote: 'Hidup hanya menunda kekalahan, tambah terasing dari cinta sekolah rendah, dan tahu, ada yang tetap tidak diucapkan, sebelum pada akhirnya kita menyerah.',
    author: 'Chairil Anwar',
    work: 'Derai-Derai Cemara',
    year: '1949',
  },
  {
    id: 'quote-5',
    quote: 'Di depan jendela aku menunggu sebuah kabar, yang ditulis dengan tinta kejujuran kata tanpa kepalsuan makna.',
    author: 'Joko Pinurbo',
    work: 'Celana',
    year: '1999',
  },
  {
    id: 'quote-6',
    quote: 'Bahasa adalah rumah bagi akal budi; menjaganya tetap jernih berarti menjaga martabat peradaban kita.',
    author: 'Sutan Takdir Alisjahbana',
    work: 'Tata Bahasa Baru Bahasa Indonesia',
    year: '1949',
  },
  {
    id: 'quote-7',
    quote: 'Bermimpilah, karena Tuhan akan memeluk mimpi-mimpimu dan menuntun langkahmu menjemputnya.',
    author: 'Andrea Hirata',
    work: 'Laskar Pelangi',
    year: '2005',
  },
  {
    id: 'quote-8',
    quote: 'Kata-kata adalah jendela ke dalam nurani. Jika kata-katamu keruh, sulit bagi orang lain melihat ketulusanmu.',
    author: 'Mochtar Lubis',
    work: 'Jalan Tak Ada Ujung',
    year: '1952',
  },
  {
    id: 'quote-9',
    quote: 'Menulis adalah sebuah keberanian untuk jujur kepada diri sendiri di tengah riuh dunia yang serba pura-pura.',
    author: 'Ayu Utami',
    work: 'Saman',
    year: '1998',
  },
];

export function getDailyQuote(customIndex?: number): LiteraryQuote {
  if (typeof customIndex === 'number' && customIndex >= 0) {
    return LITERARY_QUOTES[customIndex % LITERARY_QUOTES.length];
  }
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  return LITERARY_QUOTES[dayOfYear % LITERARY_QUOTES.length];
}
