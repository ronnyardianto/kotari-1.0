# KOTARI (Korektor Tata Bahasa Republik Indonesia)

Aplikasi web pendeteksi dan penyunting kalimat tidak efektif dalam bahasa Indonesia yang berlandaskan kaidah **Tata Bahasa Baku Bahasa Indonesia** dan **Pedoman Umum Ejaan Bahasa Indonesia yang Disempurnakan (EYD Edisi V / SK Kepala Badan Bahasa No. 0424/I/BS.00.01/2022)**. Aplikasi dilengkapi fitur **Pindai Tulisan** (kamera live dan unggah foto dengan OCR Vision), **Kotak Paragraf** (kapasitas 5 kalimat), **Sorotan Kesalahan 3 Warna** (Merah: tanda baca, Kuning: kata tipo/salah tulis, Biru: rekomendasi diksi/keefektifan), **Repositoriku** (bank kosakata personal dengan ekspor-impor), serta **Asisten AI KOTARI** yang komunikatif.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Konfirmasi preferensi dan keputusan kunci yang telah disepakati:
> - **Sistem Penyimpanan Repositoriku**: Penyimpanan lokal di perangkat (*Local Storage / IndexedDB*) dengan cadangan (*backup*) file JSON ekspor dan impor mandiri, serta pre-seed ribuan entri kosakata baku/serapan EYD V.
> - **Format Asisten AI KOTARI**: Panel percakapan interaktif yang responsif dan berdampingan (*side-by-side split* di desktop atau *sliding drawer* di mobile) dengan kartu telaah per kalimat.
> - **Alur Pindai Tulisan**: Menggunakan kamera langsung (*live video stream* WebRTC) dengan tombol bidik instan, tombol ganti kamera (depan/belakang), serta alternatif unggah foto dokumen dari galeri.
> - **Highlight 3 Warna**: Merah untuk tanda baca & kapitalisasi (*SK EYD Bab I & III*), Kuning untuk salah eja/tipo (*SK EYD Bab II & IV*), dan Biru untuk rekomendasi diksi/kalimat rancu/pleonasme (*Tata Bahasa Baku Bab IX & X*).

---

## 1. Overview & Core Concept

- **Apa itu KOTARI**: Solusi terpadu bagi pelajar, guru, mahasiswa, penulis, dan profesional untuk menguji keefektifan kalimat secara instan, memahami letak kelemahan sintaksis (ketiadaan subjek/predikat, anak kalimat menggantung, pleonasme, ketaksaan), serta memperbaiki ejaan dan tanda baca sesuai pedoman resmi nasional.
- **Sasaran Pengguna**: Siswa sekolah menengah, mahasiswa, pengajar, peneliti, penulis naskah, dan aparatur sipil yang membutuhkan penulisan naskah formal baku.
- **Nilai Utama**:
  1. *Akurasi Tinggi*: Menggabungkan basis aturan linguistik eksplisit (*rule engine*) dan kecerdasan multimodal AI (*Gemini 3.8 Flash*) yang di-*prompt* dengan korpus Tata Bahasa Baku & SK EYD V.
  2. *Umpan Balik Visual Jernih*: Sorotan 3 warna yang interaktif dengan *tooltip* penjelasan saat kata disentuh/diklik.
  3. *Ringkasan Sintaksis Lengkap*: Setiap kalimat menampilkan pembedahan struktur (S-P-O-Pel-K), status efektivitas (Efektif / Kurang Efektif / Tidak Efektif), dan opsi perbaikan sekali klik (*terapkan koreksi*).
  4. *Repositori Mandiri*: Fitur pembendaharaan kata baru yang diperkaya oleh pengguna untuk memperkuat perbendaharaan leksikal.

---

## 2. User Experience & Visual Design

Mengacu pada gaya visual elegan dan modern dari referensi desain (Viora AI & App Builder mockups), aplikasi menyajikan estetika *clean light/dark mode*, kartu bersudut membulat lembut (*rounded-2xl*), kartu telaah terstruktur, dan panel asisten yang ramah tanpa *visual clutter*.

### A. Alur Pengguna Utama (Key User Flows)

```
[ PENGGUNA ]
     │
     ├──► [ Pindai Tulisan ] ──► Kamera Live / Unggah Foto ──► OCR Vision Gemini ──┐
     │                                                                             │
     └──► [ Kotak Paragraf ] ──► Ketik/Tempel Teks (Maks 5 Kalimat) ───────────────┼──► [ Mesin Analisis KOTARI ]
                                                                                   │          │
                                                                                   │          ▼
     ┌─────────────────────────────────────────────────────────────────────────────┘   [ Hasil Telaah ]
     │                                                                                        │
     ├──► Sorotan 3 Warna: [Merah: Tanda Baca] [Kuning: Tipo] [Biru: Diksi]                   │
     ├──► Kartu Analisis Per Kalimat (Pola S-P-O-K, Alasan Ketidakefektifan, Saran Gubahan)  │
     ├──► Ringkasan Statistik Efektivitas (Skor %, Kategori Pelanggaran, Tombol Salin Baku)   │
     ├──► Asisten AI KOTARI: Tanya jawab langsung tentang aturan EYD & rekomendasi sintaksis ◄┘
     │
     └──► [ Repositoriku ] ──► Jelajah Kosakata, Tambah Kata Baru, Latihan Diksi, Ekspor/Impor JSON
```

### B. Identitas Visual & Desain Antarmuka

- **Aesthetic Direction**: *Minimalist modern editorial with linguistic precision* — perpaduan kenyamanan membaca, tipografi bersih, dan indikator warna yang tidak melelahkan mata.
- **Palet Warna & Sorotan**:
  - Kanvas Utama: `bg-slate-50 dark:bg-slate-950`
  - Kartu & Permukaan: `bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800`
  - Aksen Primer: `text-indigo-600 dark:text-indigo-400`, `bg-indigo-600 hover:bg-indigo-700`
  - **Sorotan Kesalahan (Highlight Trilateral)**:
    - 🔴 **Merah (Tanda Baca & Huruf Kapital)**: `bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-200 border-b-2 border-rose-500`
    - 🟡 **Kuning (Kata Tipo & Ejaan Asing/Serapan)**: `bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border-b-2 border-amber-500`
    - 🔵 **Biru (Rekomendasi Ganti Diksi & Keefektifan Kalimat)**: `bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200 border-b-2 border-sky-500`
- **Tipografi**:
  - Judul & Display: *Plus Jakarta Sans* (modern, tegas, keterbacaan tinggi)
  - Isi Tulisan: *Plus Jakarta Sans* / *DM Sans* dengan `tracking-normal` dan `leading-relaxed`
  - Angka & Metrik: `tabular-nums`
- **Animasi & Interaksi**:
  - Transisi tab mulus menggunakan Motion (`motion.div` dengan *fade & slide*)
  - Efek sorotan teks dinamis dengan *tooltip popover* interaktif
  - Bidikan kamera dengan *shutter feedback animation* dan pemindaian *scanline overlay*

---

## 3. Key Product Decisions & Trade-Offs

1. **Pemrosesan Kalimat Tersegmentasi (Maksimal 5 Kalimat)**:
   - *Pilihan*: Memecah input teks menjadi per kalimat (1 s.d. 5 kalimat), menganalisis masing-masing struktur (Subjek, Predikat, Objek, Pelengkap, Keterangan) secara terperinci, lalu mengukur kesatuan proposisi dan kepaduan antarklausa.
   - *Alasan*: Kalimat tidak efektif paling mudah dipahami ketika dibedah per butir klausa secara transparan daripada memberikan satu blok teks tanpa rincian.
2. **Kamera WebRTC + Unggah Dokumen**:
   - *Pilihan*: Dukungan ganda: kamera web langsung dengan akses `navigator.mediaDevices` serta opsi unggah foto dokumen jika browser membatasi izin kamera.
   - *Alasan*: Kompatibel di ponsel (Android/iOS) maupun laptop/PC desktop.
3. **Penyimpanan Kosakata Repositoriku Mandiri**:
   - *Pilihan*: *Client-side storage* terstruktur (*localStorage* / *IndexedDB*) berkapasitas ribuan kata, dipadukan fitur ekspor file `.json` dan impor cadangan data.
   - *Alasan*: Cepat, instan tanpa perlu registrasi akun, aman, dan data tersimpan privat di perangkat pengguna.
4. **Server Proxy Gemini 3.8 Flash**:
   - *Pilihan*: Menggunakan endpoint server `/api/kotari/analyze`, `/api/kotari/ocr`, dan `/api/kotari/chat` memanfaatkan SDK `@google/genai` dengan model `gemini-3.8-flash`.
   - *Alasan*: Menjaga kunci API aman di server, mendukung analisis citra tulisan tangan/cetak (OCR), dan menghasilkan struktur JSON valid terperinci.

---

## 4. Technical Architecture & Data Strategy

### Diagram Arsitektur Sistem

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KOTARI FRONTEND (REACT SPA)                     │
│                                                                        │
│  ┌──────────────────┐  ┌────────────────────┐  ┌────────────────────┐  │
│  │   Kotak Paragraf │  │   Pindai Tulisan   │  │    Repositoriku    │  │
│  │  (Input Teks 5)  │  │ (Kamera & Galeri)  │  │  (Bank Kosakata)   │  │
│  └─────────┬────────┘  └─────────┬──────────┘  └─────────┬──────────┘  │
│            │                     │                       │             │
│            ▼                     ▼                       ▼             │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │               State Manager & Local Storage Store            │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│  ┌───────────────────────────────┴──────────────────────────────┐      │
│  │                     Asisten AI KOTARI Panel                  │      │
│  └───────────────────────────────┬──────────────────────────────┘      │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ HTTP API
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND (server.ts)                         │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│  │ POST /api/ocr    │  │ POST /api/analyze│  │ POST /api/assistant   │ │
│  │ Ekstraksi Gambar │  │ Pengecekan EYD   │  │ Konsultasi Linguistik │ │
│  └─────────┬────────┘  └─────────┬────────┘  └───────────┬───────────┘ │
│            │                     │                       │             │
│            └─────────────────────┼───────────────────────┘             │
│                                  ▼                                     │
│                     @google/genai (gemini-3.8-flash)                   │
│          Grounding: EYD V 2022 & Tata Bahasa Baku Indonesia            │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Interface Utama

```typescript
// Struktur Kesalahan Teks
export interface ErrorAnnotation {
  id: string;
  type: 'punctuation' | 'typo' | 'diction'; // Merah | Kuning | Biru
  startChar: number;
  endChar: number;
  faultyText: string;
  suggestion: string;
  explanation: string;
  ruleReference: string; // Misal: "SK EYD V Pasal 23: Huruf Kapital Sapaan" atau "Tata Bahasa Baku 9.4.1: Pola Kalimat S-P"
}

// Analisis Per Kalimat
export interface SentenceAnalysis {
  sentenceIndex: number;
  originalSentence: string;
  isEffective: boolean;
  effectivenessScore: number; // 0 - 100
  structure: {
    subject?: string;
    predicate?: string;
    object?: string;
    complement?: string;
    adverbial?: string;
    hasCompleteElements: boolean;
  };
  ineffectiveReasons: string[];
  annotations: ErrorAnnotation[];
  improvedSentence: string;
  summaryExplanation: string;
}

// Model Kosakata Repositoriku
export interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: 'Nomina' | 'Verba' | 'Adjektiva' | 'Adverbia' | 'Konjungsi' | 'Lainnya';
  definition: string;
  exampleSentence: string;
  sourceCategory: 'EYD V' | 'Serapan' | 'Baku' | 'Pengguna';
  addedAt: string;
  notes?: string;
}
```

---

## 5. Rencana Tahapan Eksekusi

1. **Konfigurasi Server & Gemini Full-Stack**:
   - Siapkan `server.ts` dengan Express, vite middleware, dan integrasi `@google/genai` (model `gemini-3.8-flash`).
   - Sediakan rute backend:
     - `/api/kotari/analyze`: Menganalisis kalimat terhadap kaidah EYD V dan Tata Bahasa Baku (mengembalikan skor, anotasi 3 warna, S-P-O-K, dan rekomendasi revisi).
     - `/api/kotari/ocr`: Membaca tulisan tangan atau teks dokumen dari tangkapan kamera/foto.
     - `/api/kotari/chat`: Tanya jawab konsultasi asisten AI interaktif.
2. **Pengembangan Antarmuka Interaktif**:
   - Header aplikasi dengan identitas KOTARI dan navigasi tab modern.
   - Modul **Pindai Tulisan**: Pratinjau kamera langsung, pergantian kamera, jepret foto, *crop/preview*, dan OCR instan.
   - Modul **Kotak Paragraf**: Area ketik maksimal 5 kalimat dengan penghitung kalimat *real-time*.
   - Modul **Hasil Analisis**: Tampilan teks dengan *inline highlight* 3 warna (Merah, Kuning, Biru), *popover info*, kartu bedah S-P-O-K per kalimat, dan ringkasan efektivitas di bagian bawah.
   - Modul **Asisten AI KOTARI**: Panel percakapan interaktif dengan *quick prompts* kebahasaan.
   - Modul **Repositoriku**: Manajemen kosakata lokal, pencarian, filter kelas kata, penambahan kosakata baru, serta ekspor & impor file JSON.
3. **Verifikasi & Penyempurnaan**:
   - Uji kompilasi (`compile_applet`), audit tata letak responsif di ponsel dan desktop, serta pemenuhan kaidah EYD V dan Tata Bahasa Baku.
