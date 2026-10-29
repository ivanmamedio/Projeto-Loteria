import { describe, expect, it } from 'vitest';

import { mulberry32, newSeed } from './rng';

describe('rng', () => {
  it('returns values in [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('is deterministic for the same seed', () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('seed() resets the generator', () => {
    const rng = mulberry32(7);
    const first = rng.next();
    rng.seed(7);
    expect(rng.next()).toBe(first);
  });

  it('newSeed returns a 32-bit number', () => {
    const seed = newSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });
});
