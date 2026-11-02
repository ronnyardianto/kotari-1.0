import { VocabularyItem } from '../types.ts';
import { DEFAULT_VOCABULARY } from '../data/defaultVocabulary.ts';

const REPO_STORAGE_KEY = 'kotari_repositoriku_data_v1';
const HISTORY_STORAGE_KEY = 'kotari_analysis_history_v1';

export function loadVocabulary(): VocabularyItem[] {
  try {
    const raw = localStorage.getItem(REPO_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(DEFAULT_VOCABULARY));
      return DEFAULT_VOCABULARY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_VOCABULARY;
  } catch (e) {
    console.error('Failed to load vocabulary from storage:', e);
    return DEFAULT_VOCABULARY;
  }
}

export function saveVocabulary(items: VocabularyItem[]): void {
  try {
    localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save vocabulary to storage:', e);
  }
}

export function addVocabularyItem(
  item: Omit<VocabularyItem, 'id' | 'createdAt'>
): VocabularyItem {
  const current = loadVocabulary();
  const newItem: VocabularyItem = {
    ...item,
    id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  const updated = [newItem, ...current];
  saveVocabulary(updated);
  return newItem;
}

export function deleteVocabularyItem(id: string): VocabularyItem[] {
  const current = loadVocabulary();
  const updated = current.filter((item) => item.id !== id);
  saveVocabulary(updated);
  return updated;
}

export function toggleFavoriteVocabulary(id: string): VocabularyItem[] {
  const current = loadVocabulary();
  const updated = current.map((item) =>
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
  );
  saveVocabulary(updated);
  return updated;
}

export function exportVocabularyJSON(): void {
  const items = loadVocabulary();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `kotari-repositoriku-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importVocabularyJSON(
  jsonString: string
): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'Format berkas harus berupa array JSON.' };
    }
    const current = loadVocabulary();
    const existingIds = new Set(current.map((item) => item.word.toLowerCase().trim()));
    const validItems: VocabularyItem[] = [];

    for (const item of parsed) {
      if (item && item.word && item.definition) {
        if (!existingIds.has(item.word.toLowerCase().trim())) {
          validItems.push({
            id: item.id || `vocab-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            word: item.word.trim(),
            partOfSpeech: item.partOfSpeech || 'Nomina',
            definition: item.definition.trim(),
            exampleSentence: item.exampleSentence || '',
            sourceCategory: item.sourceCategory || 'Tambahan Pengguna',
            notes: item.notes || '',
            createdAt: item.createdAt || new Date().toISOString().split('T')[0],
            isFavorite: !!item.isFavorite,
          });
          existingIds.add(item.word.toLowerCase().trim());
        }
      }
    }

    const merged = [...validItems, ...current];
    saveVocabulary(merged);
    return { success: true, count: validItems.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || 'Gagal memproses JSON.' };
  }
}

export function loadAnalysisHistory(): any[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnalysisHistory(item: any): void {
  try {
    const current = loadAnalysisHistory();
    const updated = [item, ...current].slice(0, 10);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}
