/**
 * Histórico local de lotes gerados (versionado, limite 20).
 */

export const HISTORY_STORAGE_KEY = 'loteria:history:v1';
export const HISTORY_LIMIT = 20;

export interface HistoryEntry {
  readonly id: string;
  readonly modalidade: string;
  readonly dezenas: readonly number[];
  readonly timestamp: string;
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.modalidade === 'string' &&
    Array.isArray(v.dezenas) &&
    v.dezenas.every((n) => typeof n === 'number') &&
    typeof v.timestamp === 'string'
  );
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function loadHistory(): HistoryEntry[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = s.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function saveHistory(entries: readonly HistoryEntry[]): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  } catch {
    // ignore storage errors
  }
}

export function addHistory(entry: HistoryEntry): HistoryEntry[] {
  const current = loadHistory();
  const next = [entry, ...current.filter((e) => e.id !== entry.id)].slice(0, HISTORY_LIMIT);
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // ignore
  }
}
