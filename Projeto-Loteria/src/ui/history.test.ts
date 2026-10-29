import { describe, expect, it } from 'vitest';

import { addHistory, clearHistory, loadHistory } from './history';

describe('history', () => {
  it('handles corrupted storage gracefully', () => {
    const store = new Map<string, string>();
    const fake = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    } as Storage;
    (globalThis as { localStorage?: Storage }).localStorage = fake;
    store.set('loteria:history:v1', '{bad json');
    expect(loadHistory()).toEqual([]);
    clearHistory();
    (globalThis as { localStorage?: Storage }).localStorage = undefined as unknown as Storage;
  });

  it('adds entries', () => {
    const store = new Map<string, string>();
    const fake = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    } as Storage;
    (globalThis as { localStorage?: Storage }).localStorage = fake;
    const next = addHistory({ id: '1', modalidade: 'mega-sena', dezenas: [1, 2], timestamp: 't' });
    expect(next).toHaveLength(1);
    (globalThis as { localStorage?: Storage }).localStorage = undefined as unknown as Storage;
  });
});
