export type ErrorType = 'punctuation' | 'typo' | 'diction';

export interface ErrorAnnotation {
  id: string;
  type: ErrorType;
  faultyText: string;
  suggestion: string;
  explanation: string;
  ruleReference: string;
}

export interface SentenceStructure {
  subject: string;
  predicate: string;
  object?: string;
  complement?: string;
  adverbial?: string;
  analysis: string;
}

export interface SentenceAnalysis {
  index: number;
  original: string;
  isEffective: boolean;
  score: number;
  structure: SentenceStructure;
  ineffectiveReasons: string[];
  annotations: ErrorAnnotation[];
  improvedSentence: string;
  sentenceSummary: string;
}

export interface AnalysisResult {
  overallScore: number;
  overallSummary: string;
  sentences: SentenceAnalysis[];
}

export type WordClass = 'Nomina' | 'Verba' | 'Adjektiva' | 'Adverbia' | 'Konjungsi' | 'Lainnya';
export type WordCategory = 'EYD V' | 'Kata Serapan' | 'Kata Baku' | 'Tambahan Pengguna';

export interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: WordClass;
  definition: string;
  exampleSentence: string;
  sourceCategory: WordCategory;
  notes?: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
