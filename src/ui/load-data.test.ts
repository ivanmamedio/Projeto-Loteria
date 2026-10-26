import { describe, expect, it, vi } from 'vitest';

import { loadData } from './load-data';

describe('load-data', () => {
  it('returns error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));
    const result = await loadData('http://example.com/x.json');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('boom');
    vi.unstubAllGlobals();
  });

  it('returns data on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ schemaVersion: 1, value: 42 }),
      }),
    );
    const result = await loadData<{ value: number }>('http://example.com/x.json');
    expect(result.ok).toBe(true);
    expect(result.data?.value).toBe(42);
    vi.unstubAllGlobals();
  });
});
