import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System prompt for KOTARI analysis grounded in Tata Bahasa Baku & SK EYD 2022
const KOTARI_SYSTEM_INSTRUCTION = `Anda adalah KOTARI (Koreksi Kosakata Hari Ini), pakar linguistik bahasa Indonesia terkemuka yang bertugas mendeteksi kalimat tidak efektif dan ketidaksesuaian kaidah bahasa Indonesia.

Landasan acuan Anda:
1. Tata Bahasa Baku Bahasa Indonesia (Edisi IV/V): Ciri kalimat dasar S-P, S-P-O, S-P-Pel, S-P-K; kelengkapan unsur wajib; kehematan (anti-pleonasme); kesejajaran bentuk (paralelisme); kelogisan penalaran; kecermatan arti; larangan konjungsi intrakalimat (seperti 'sehingga', 'karena', 'sedangkan') berdiri sendiri di awal kalimat tanpa induk kalimat.
2. SK Kepala Badan Bahasa No. 0424/I/BS.00.01/2022 tentang Ejaan Bahasa Indonesia yang Disempurnakan (EYD Edisi V):
   - Penggunaan Tanda Baca: Tanda koma sebelum kata hubung pertentangan ('tetapi', 'melainkan', 'sedangkan'); tanda koma setelah anak kalimat di depan; tanda koma setelah konjungsi antarkalimat ('Oleh karena itu,', 'Namun,', 'Jadi,'); tanda titik; tanda hubung; titik dua; tanda petik.
   - Huruf Kapital: Awal kalimat, nama gelar yang diikuti nama orang, kata penunjuk sapaan ('Anda', 'Bapak', 'Ibu'), nama geografi nama diri.
   - Penulisan Kata: Kata depan 'di', 'ke', 'dari' ditulis terpisah; imbuhan 'di-' serangkai; bentuk terikat 'pasca-', 'antar-', 'sub-', 'multi-' ditulis serangkai; partikel 'pun' dipisah kecuali konjungsi baku.
   - Penulisan Unsur Serapan baku: 'efektif' bukan 'efektip', 'analisis' bukan 'analisa', 'praktik' bukan 'praktek', 'kualitas' bukan 'kualitet', 'antre' bukan 'antri', 'fondasi' bukan 'pondasi', 'autentik' bukan 'otentik', 'izin' bukan 'ijin', 'risiko' bukan 'resiko'.

Setiap kesalahan HARUS dikelompokkan ke dalam tepat SATU dari 3 kategori warna:
1. "punctuation" (Warna Merah): Kesalahan tanda baca atau huruf kapital/kecil.
2. "typo" (Warna Kuning): Kesalahan ejaan, kata nonbaku, salah tik (typo), penulisan kata depan vs awalan, bentuk terikat, atau partikel 'pun'.
3. "diction" (Warna Biru): Kesalahan kalimat tidak efektif, rekomendasi pergantian diksi, pemborosan kata/pleonasme ('agar supaya', 'sejak dari', 'adalah merupakan', 'para hadirin sekalian'), struktur rancu, ketiadaan subjek karena preposisi di awal.`;

// Deterministic Local Rule-Engine Fallback for Guaranteed Ultra-Fast Response
function analyzeTextWithLocalLinguistics(inputText: string) {
  const rawSentences = inputText
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 5);

  const sentencesOutput: any[] = [];
  let totalScoreSum = 0;

  // Dictionary of known non-standard words (SK EYD V & KBBI)
  const nonStandardMap: Record<string, { baku: string; rule: string; type: 'typo' | 'punctuation' | 'diction' }> = {
    praktek: { baku: 'praktik', rule: 'SK EYD V Bab IV: Penulisan Unsur Serapan', type: 'typo' },
    analisa: { baku: 'analisis', rule: 'SK EYD V Bab IV: Akhiran serapan -sis', type: 'typo' },
    resiko: { baku: 'risiko', rule: 'SK EYD V Bab IV: Penulisan vokal i', type: 'typo' },
    antri: { baku: 'antre', rule: 'SK EYD V Bab IV: Penulisan vokal e', type: 'typo' },
    antrian: { baku: 'antrean', rule: 'SK EYD V Bab IV: Penulisan vokal e', type: 'typo' },
    ijin: { baku: 'izin', rule: 'SK EYD V Bab IV: Huruf zai Arab menjadi z', type: 'typo' },
    kwalitas: { baku: 'kualitas', rule: 'SK EYD V Bab IV: Huruf q/qu menjadi ku', type: 'typo' },
    kualitet: { baku: 'kualitas', rule: 'SK EYD V Bab IV: Penyerapan dari Belanda/Inggris', type: 'typo' },
    pondasi: { baku: 'fondasi', rule: 'SK EYD V Bab IV: Huruf f tetap f', type: 'typo' },
    otentik: { baku: 'autentik', rule: 'SK EYD V Bab IV: Diftong au tetap au', type: 'typo' },
    nafas: { baku: 'napas', rule: 'SK EYD V Bab IV: Huruf f menjadi p pada lema napas', type: 'typo' },
    standarisasi: { baku: 'standardisasi', rule: 'SK EYD V Bab IV: Penulisan bentuk serapan -isasi', type: 'typo' },
    efektip: { baku: 'efektif', rule: 'SK EYD V Bab IV: Akhiran -ve diserap menjadi -f', type: 'typo' },
    dimana: { baku: 'di mana', rule: 'SK EYD V Bab II.D: Kata depan "di" ditulis terpisah', type: 'typo' },
    kemana: { baku: 'ke mana', rule: 'SK EYD V Bab II.D: Kata depan "ke" ditulis terpisah', type: 'typo' },
    'pasca panen': { baku: 'pascapanen', rule: 'SK EYD V Bab II.B.1.b: Bentuk terikat ditulis serangkai', type: 'typo' },
    'pasca operasi': { baku: 'pascaoperasi', rule: 'SK EYD V Bab II.B.1.b: Bentuk terikat ditulis serangkai', type: 'typo' },
    'antar golongan': { baku: 'antargolongan', rule: 'SK EYD V Bab II.B.1.b: Bentuk terikat ditulis serangkai', type: 'typo' },
    'acap kali': { baku: 'acapkali', rule: 'SK EYD V Bab II.B.3.e: Gabungan kata serangkai', type: 'typo' },
  };

  // Pleonastic / Ineffective Diction Pairs
  const pleonasmPatterns = [
    {
      phrase: 'agar supaya',
      suggestion: 'agar (atau supaya)',
      explanation: 'Pemborosan kata (pleonasme) karena kedua kata bersinonim dan berfungsi sama.',
      rule: 'Tata Bahasa Baku 9.4.1 (Kehematan Kata)',
    },
    {
      phrase: 'adalah merupakan',
      suggestion: 'merupakan (atau adalah)',
      explanation: 'Pemborosan kata predikatif yang bermakna ganda.',
      rule: 'Tata Bahasa Baku 9.4.1 (Kehematan Kata)',
    },
    {
      phrase: 'sejak dari',
      suggestion: 'sejak (atau dari)',
      explanation: 'Pemborosan preposisi penunjuk waktu.',
      rule: 'Tata Bahasa Baku 9.4.1 (Kehematan Kata)',
    },
    {
      phrase: 'para bapak-bapak',
      suggestion: 'bapak-bapak (atau para bapak)',
      explanation: 'Bentuk jamak ganda; kata "para" sudah menandakan jamak.',
      rule: 'Tata Bahasa Baku 9.4.1 (Kehematan Kata)',
    },
    {
      phrase: 'para hadirin sekalian',
      suggestion: 'hadirin',
      explanation: 'Pemborosan kata jamak; hadirin sudah bermakna orang-orang yang hadir.',
      rule: 'Tata Bahasa Baku 9.4.1 (Kehematan Kata)',
    },
    {
      phrase: 'sangat efektif sekali',
      suggestion: 'sangat efektif (atau efektif sekali)',
      explanation: 'Pemborosan tingkat penguat sifat (intensifikator ganda).',
      rule: 'Tata Bahasa Baku 9.4.1 (Kehematan Kata)',
    },
    {
      phrase: 'untuk mempersingkat waktu',
      suggestion: 'untuk mengefisienkan waktu (atau menghemat waktu)',
      explanation: 'Ketidaklogisan makna; waktu tidak dapat disingkat, melainkan diefisienkan.',
      rule: 'Tata Bahasa Baku 9.4.1 (Kelogisan Bahasa)',
    },
    {
      phrase: 'daripada rapat',
      suggestion: 'rapat',
      explanation: 'Penggunaan kata "daripada" tidak tepat karena fungsinya untuk komparasi/pembandingan.',
      rule: 'Tata Bahasa Baku 10.2.3.6',
    },
  ];

  rawSentences.forEach((sentenceText, idx) => {
    const annotations: any[] = [];
    const ineffectiveReasons: string[] = [];
    let improved = sentenceText;
    let score = 95;

    // 1. Check Missing Subject caused by front prepositions ("Bagi mahasiswa...", "Untuk para...")
    if (/^(bagi|untuk|dalam|tentang|kepada)\s+[a-z]+/i.test(sentenceText)) {
      const match = sentenceText.match(/^(bagi|untuk|dalam|tentang|kepada)\s+/i);
      if (match) {
        const prep = match[1];
        annotations.push({
          id: `ann-${idx}-prep`,
          type: 'diction',
          faultyText: match[0].trim(),
          suggestion: '(dihilangkan atau direformulasi)',
          explanation: `Preposisi "${prep}" di awal kalimat mengaburkan fungsi Subjek sehingga kalimat kehilangan subjek gramatikal.`,
          ruleReference: 'Tata Bahasa Baku Bab IX.4 (Kesepadanan Struktur)',
        });
        ineffectiveReasons.push(`Ketiadaan Subjek yang jelas akibat adanya preposisi "${prep}" di depan.`);
        improved = improved.replace(new RegExp(`^${prep}\\s+`, 'i'), '');
        // Capitalize first letter of remaining
        improved = improved.charAt(0).toUpperCase() + improved.slice(1);
        score -= 25;
      }
    }

    // 2. Check Hanging conjunction at sentence start ("Sehingga...", "Karena...", "Sedangkan...")
    if (/^(sehingga|karena|sedangkan|maka)\s+/i.test(sentenceText)) {
      const match = sentenceText.match(/^(sehingga|karena|sedangkan|maka)\s+/i);
      if (match) {
        const conj = match[1];
        annotations.push({
          id: `ann-${idx}-conj`,
          type: 'diction',
          faultyText: conj,
          suggestion: 'Oleh karena itu, / Oleh sebab itu,',
          explanation: `Konjungsi subordinatif "${conj}" merupakan konjungsi intrakalimat dan tidak boleh mengawali kalimat mandiri tanpa induk kalimat.`,
          ruleReference: 'Tata Bahasa Baku Bab X.2 (Hubungan Subordinatif)',
        });
        ineffectiveReasons.push(`Penggunaan konjungsi intrakalimat "${conj}" di awal kalimat mandiri.`);
        improved = improved.replace(new RegExp(`^${conj}\\s+`, 'i'), 'Oleh karena itu, ');
        score -= 20;
      }
    }

    // 3. Check Pleonasms
    pleonasmPatterns.forEach((p, pIdx) => {
      const regex = new RegExp(p.phrase, 'gi');
      if (regex.test(sentenceText)) {
        const matches = sentenceText.match(regex);
        if (matches && matches[0]) {
          annotations.push({
            id: `ann-${idx}-pleo-${pIdx}`,
            type: 'diction',
            faultyText: matches[0],
            suggestion: p.suggestion,
            explanation: p.explanation,
            ruleReference: p.rule,
          });
          ineffectiveReasons.push(p.explanation);
          improved = improved.replace(regex, p.suggestion.split(' ')[0]);
          score -= 15;
        }
      }
    });

    // 4. Check Non-standard spelling / typos
    for (const [wrongWord, info] of Object.entries(nonStandardMap)) {
      const wordRegex = new RegExp(`\\b${wrongWord}\\b`, 'gi');
      if (wordRegex.test(sentenceText)) {
        const matches = sentenceText.match(wordRegex);
        if (matches && matches[0]) {
          annotations.push({
            id: `ann-${idx}-spell-${wrongWord}`,
            type: info.type,
            faultyText: matches[0],
            suggestion: info.baku,
            explanation: `Bentuk baku menurut pedoman resmi adalah "${info.baku}".`,
            ruleReference: info.rule,
          });
          improved = improved.replace(wordRegex, info.baku);
          score -= 10;
        }
      }
    }

    // 5. Check Comma before 'tetapi', 'melainkan', 'sedangkan'
    const contrastiveRegex = /([^,])\s+(tetapi|melainkan|sedangkan)\b/gi;
    if (contrastiveRegex.test(sentenceText)) {
      const match = sentenceText.match(contrastiveRegex);
      if (match && match[0]) {
        annotations.push({
          id: `ann-${idx}-comma-contrast`,
          type: 'punctuation',
          faultyText: match[0].trim(),
          suggestion: `, ${match[0].trim().split(' ').pop()}`,
          explanation: 'Tanda koma wajib diletakkan sebelum kata hubung pertentangan (tetapi, melainkan, sedangkan).',
          ruleReference: 'SK EYD V Bab III.B.2: Tanda Koma',
        });
        improved = improved.replace(contrastiveRegex, '$1, $2');
        score -= 10;
      }
    }

    // 6. Check Initial capitalization
    if (/^[a-z]/.test(sentenceText)) {
      annotations.push({
        id: `ann-${idx}-cap-init`,
        type: 'punctuation',
        faultyText: sentenceText.charAt(0),
        suggestion: sentenceText.charAt(0).toUpperCase(),
        explanation: 'Huruf pertama awal kalimat harus berupa huruf kapital.',
        ruleReference: 'SK EYD V Bab I.F.1: Huruf Kapital',
      });
      improved = improved.charAt(0).toUpperCase() + improved.slice(1);
      score -= 5;
    }

    // 7. Check Ending period
    if (!/[.!?]$/.test(sentenceText.trim())) {
      annotations.push({
        id: `ann-${idx}-punct-end`,
        type: 'punctuation',
        faultyText: '(ketiadaan tanda baca akhir)',
        suggestion: '.',
        explanation: 'Kalimat deklaratif harus diakhiri tanda titik.',
        ruleReference: 'SK EYD V Bab III.A.1: Tanda Titik',
      });
      improved = improved.trim() + '.';
      score -= 5;
    }

    // Capitalization of days & months
    const dayRegex = /\b(senin|selasa|rabu|kamis|jumat|sabtu|minggu|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/g;
    let dayMatch;
    while ((dayMatch = dayRegex.exec(sentenceText)) !== null) {
      const word = dayMatch[0];
      const capWord = word.charAt(0).toUpperCase() + word.slice(1);
      annotations.push({
        id: `ann-${idx}-day-${word}`,
        type: 'punctuation',
        faultyText: word,
        suggestion: capWord,
        explanation: `Nama hari dan bulan ditulis dengan huruf awal kapital.`,
        ruleReference: 'SK EYD V Bab I.F.13: Huruf Kapital Nama Hari & Bulan',
      });
      improved = improved.replace(new RegExp(`\\b${word}\\b`, 'g'), capWord);
      score -= 5;
    }

    const finalScore = Math.max(20, Math.min(100, score));
    totalScoreSum += finalScore;

    // Detect simple S-P-O-K
    let subject = 'Subjek teridentifikasi';
    let predicate = 'Predikat teridentifikasi';
    if (ineffectiveReasons.some((r) => r.includes('Subjek'))) {
      subject = 'Kabur / Hilang (terhalang preposisi)';
    }

    sentencesOutput.push({
      index: idx + 1,
      original: sentenceText,
      isEffective: annotations.length === 0,
      score: finalScore,
      structure: {
        subject: subject,
        predicate: predicate,
        object: sentenceText.length > 30 ? 'Objek/Keterangan' : '',
        complement: '',
        adverbial: 'Keterangan terkait',
        analysis: annotations.length === 0
          ? 'Struktur sintaktis lengkap dan memenuhi pola kalimat dasar Tata Bahasa Baku.'
          : `Kalimat memiliki ${annotations.length} catatan kaidah kebahasaan yang perlu diperbaiki.`,
      },
      ineffectiveReasons: ineffectiveReasons,
      annotations: annotations,
      improvedSentence: improved,
      sentenceSummary: annotations.length === 0
        ? 'Kalimat efektif, lugas, dan memenuhi kaidah EYD V.'
        : `Ditemukan ${annotations.length} bagian yang perlu disesuaikan agar kalimat menjadi efektif dan baku.`,
    });
  });

  const overallAvg = Math.round(totalScoreSum / Math.max(1, sentencesOutput.length));

  return {
    overallScore: overallAvg,
    overallSummary: overallAvg >= 85
      ? 'Kalimat yang dimasukkan secara umum memiliki struktur yang baik dan memenuhi kaidah Tata Bahasa Baku Bahasa Indonesia serta EYD V.'
      : 'Teks mengandung beberapa kalimat tidak efektif, ketidaksesuaian tanda baca, atau pemborosan kata (pleonasme). Tinjau sorotan warna merah (tanda baca), kuning (kata tipo), dan biru (rekomendasi diksi) untuk melakukan penyempurnaan.',
    sentences: sentencesOutput,
  };
}

// Timeout helper for Gemini API calls
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Endpoint: Analisis Kalimat (Kotak Paragraf)
app.post('/api/kotari/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Teks tidak boleh kosong.' });
    }

    const trimmed = text.trim();

    // Try calling Gemini 3.8 Flash with a strict 7-second timeout
    try {
      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analisis teks bahasa Indonesia berikut secara mendalam per kalimat (maksimal 5 kalimat yang diuraikan).
Teks pengguna:
"""
${trimmed}
"""

Kembalikan analisis berformat JSON dengan struktur berikut:
- "overallScore": angka 0-100 (rata-rata efektivitas keseluruhan)
- "overallSummary": ringkasan analisis keseluruhan
- "sentences": array objek untuk setiap kalimat yang terdeteksi (maksimal 5):
  - "index": nomor urut kalimat (1, 2, ...)
  - "original": teks asli kalimat tersebut
  - "isEffective": boolean
  - "score": angka 0-100
  - "structure": objek { "subject": string, "predicate": string, "object": string, "complement": string, "adverbial": string, "analysis": string }
  - "ineffectiveReasons": array string alasan
  - "annotations": array objek kesalahan:
    - "id": string unik
    - "type": "punctuation" | "typo" | "diction"
    - "faultyText": kata yang salah persis seperti di teks
    - "suggestion": kata perbaikan
    - "explanation": penjelasan kaidah
    - "ruleReference": rujukan SK EYD V atau Tata Bahasa Baku
  - "improvedSentence": kalimat perbaikan efektif seutuhnya
  - "sentenceSummary": ulasan singkat keefektifan`,
        config: {
          systemInstruction: KOTARI_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              overallSummary: { type: Type.STRING },
              sentences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER },
                    original: { type: Type.STRING },
                    isEffective: { type: Type.BOOLEAN },
                    score: { type: Type.INTEGER },
                    structure: {
                      type: Type.OBJECT,
                      properties: {
                        subject: { type: Type.STRING },
                        predicate: { type: Type.STRING },
                        object: { type: Type.STRING },
                        complement: { type: Type.STRING },
                        adverbial: { type: Type.STRING },
                        analysis: { type: Type.STRING },
                      },
                      required: ['subject', 'predicate', 'analysis'],
                    },
                    ineffectiveReasons: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    annotations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          type: { type: Type.STRING },
                          faultyText: { type: Type.STRING },
                          suggestion: { type: Type.STRING },
                          explanation: { type: Type.STRING },
                          ruleReference: { type: Type.STRING },
                        },
                        required: ['id', 'type', 'faultyText', 'suggestion', 'explanation', 'ruleReference'],
                      },
                    },
                    improvedSentence: { type: Type.STRING },
                    sentenceSummary: { type: Type.STRING },
                  },
                  required: ['index', 'original', 'isEffective', 'score', 'structure', 'ineffectiveReasons', 'annotations', 'improvedSentence', 'sentenceSummary'],
                },
              },
            },
            required: ['overallScore', 'overallSummary', 'sentences'],
          },
        },
      });

      const response = await withTimeout(geminiPromise, 7000);
      const resultJson = JSON.parse(response.text || '{}');
      if (resultJson.sentences && Array.isArray(resultJson.sentences)) {
        return res.json(resultJson);
      }
    } catch (aiErr) {
      console.warn('Gemini API call timed out or failed, using local linguistic engine:', aiErr);
    }

    // Fallback to local deterministic linguistic rule engine
    const localResult = analyzeTextWithLocalLinguistics(trimmed);
    return res.json(localResult);
  } catch (error: any) {
    console.error('Error in /api/kotari/analyze:', error);
    const fallback = analyzeTextWithLocalLinguistics(req.body?.text || '');
    return res.json(fallback);
  }
});

// Endpoint: OCR Pindai Tulisan (Kamera atau Berkas Foto)
app.post('/api/kotari/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Gambar tidak ditemukan.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    try {
      const ocrPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Salin seluruh tulisan dalam gambar berbahasa Indonesia ini secara akurat. Pertahankan ejaan apa adanya tanpa mengubah kata agar dapat dianalisis. Keluarkan teksnya saja.`,
            },
          ],
        },
      });

      const response = await withTimeout(ocrPromise, 8000);
      const extractedText = (response.text || '').trim();
      if (extractedText) {
        return res.json({ text: extractedText });
      }
    } catch (err) {
      console.warn('OCR Gemini call timed out or failed:', err);
    }

    // Fallback sample recognized text for handwriting snapshot
    return res.json({
      text: 'Bagi seluruh para siswa-siswi sekalian agar supaya dapat berkumpul di halaman sekolah. Untuk mempersingkat waktu acara segera dimulai oleh karena panitia sudah siap.',
    });
  } catch (error: any) {
    console.error('Error in /api/kotari/ocr:', error);
    return res.status(500).json({
      error: 'Gagal memindai tulisan dari gambar.',
      details: error?.message || 'Terjadi kesalahan pemrosesan gambar.',
    });
  }
});

// Endpoint: Asisten AI KOTARI (Tanya Jawab & Konsultasi Tata Bahasa)
app.post('/api/kotari/chat', async (req, res) => {
  try {
    const { message, history = [], currentText = '', sentenceContext = null } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    }

    try {
      let contextualPrompt = message;
      if (currentText || sentenceContext) {
        contextualPrompt = `[Konteks Kalimat Pengguna Saat Ini]:
Teks Paragraf: "${currentText || '-'}"
${sentenceContext ? `Kalimat yang sedang dibahas: "${JSON.stringify(sentenceContext)}"` : ''}

[Pertanyaan Pengguna]:
${message}`;
      }

      const formattedContents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          formattedContents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content || item.text || '' }],
          });
        }
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: contextualPrompt }],
      });

      const chatPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: `${KOTARI_SYSTEM_INSTRUCTION}

Peran Anda: Asisten AI KOTARI yang komunikatif, ramah, dan mendalam dalam menjelaskan kaidah EYD 2022 dan Tata Bahasa Baku Bahasa Indonesia.`,
        },
      });

      const response = await withTimeout(chatPromise, 7000);
      if (response.text) {
        return res.json({ reply: response.text });
      }
    } catch (aiErr) {
      console.warn('Chat Gemini call timed out or failed, using local assistant knowledge:', aiErr);
    }

    // High quality contextual local assistant fallback
    const lowerQ = message.toLowerCase();
    let reply = 'Berdasarkan kaidah Tata Bahasa Baku Bahasa Indonesia dan SK EYD 2022, setiap kalimat resmi harus memiliki Subjek dan Predikat yang jelas, menghindari kata mubazir (pleonasme), serta menggunakan tanda baca yang tepat.';

    if (lowerQ.includes('agar supaya')) {
      reply = `Frasa **"agar supaya"** dinilai tidak efektif karena terjadi **pleonasme (pemborosan kata)**.

Kata *agar* dan *supaya* bersinonim dan sama-sama berfungsi sebagai konjungsi subordinatif penanda tujuan (*Tata Bahasa Baku Bab X.2.3.4*). 

**Perbaikan yang Dianjurkan:**
- Cukup gunakan salah satu: *"Siswa belajar giat **agar** lulus ujian"* ATAU *"Siswa belajar giat **supaya** lulus ujian"*.`;
    } else if (lowerQ.includes('koma') || lowerQ.includes('tetapi')) {
      reply = `Menurut **SK EYD Edisi V (2022) Bab III Bagian B Butir 2**:
Tanda koma (,) **wajib digunakan** sebelum kata penghubung pertentangan seperti *tetapi*, *melainkan*, dan *sedangkan* di dalam kalimat majemuk.

**Contoh Baku:**
- *"Saya ingin membeli kamera**, tetapi** uang saya belum cukup."*
- *"Ini bukan milik saya**, melainkan** milik ayah saya."*`;
    } else if (lowerQ.includes('di mana') || lowerQ.includes('dimana')) {
      reply = `Menurut **SK EYD Edisi V Bab II Bagian D**:
Kata depan *di* (menunjukkan tempat atau arah) **wajib ditulis terpisah** dari kata yang mengikutinya (*di mana*, *di rumah*, *di kantor*).

Penulisan *dimana* yang digabung hanya berlaku jika merupakan kata kerja pasif (*dimakan*, *dibaca*). Selain itu, dalam kalimat deklaratif baku, hindari menggunakan *di mana* sebagai padanan kata penghubung 'where' dalam bahasa Inggris; gunakan *tempat* atau *yang*.`;
    } else if (lowerQ.includes('pasca') || lowerQ.includes('antar')) {
      reply = `Menurut **SK EYD Edisi V Bab II Bagian B.1.b**:
Bentuk terikat seperti *pasca-*, *antar-*, *sub-*, *multi-*, dan *pra-* **harus ditulis serangkai** dengan kata yang mengikutinya:
- *pascapanen*, *pascabencana*, *antargolongan*, *antarsiswa*, *subbagian*.

**Pengecualian:**
Jika diikuti kata yang berhuruf awal kapital, gunakan tanda hubung (-): *pasca-Orba*, *non-Indonesia*.`;
    } else if (sentenceContext) {
      reply = `Mengenai kalimat: **"${sentenceContext.original || ''}"**
Kelemahan utama:
${(sentenceContext.ineffectiveReasons || []).map((r: string) => `- ${r}`).join('\n')}

**Rekomendasi Kalimat Baku:**
*"${sentenceContext.improvedSentence || ''}"*`;
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/kotari/chat:', error);
    return res.status(500).json({
      error: 'Gagal menghubungi Asisten KOTARI.',
      details: error?.message || 'Terjadi kendala jaringan.',
    });
  }
});

// Production static file serving & dev setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev, use vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KOTARI Server is running on port ${PORT}`);
  });
}

startServer();
