import { describe, expect, it } from 'vitest';

import { mulberry32 } from './rng';
import { reservoirSample, sampleNoReplace } from './sampling';

describe('sampling', () => {
  it('sampleNoReplace size and uniqueness', () => {
    const result = sampleNoReplace(10, 4, mulberry32(1).next);
    expect(result).toHaveLength(4);
    expect(new Set(result).size).toBe(4);
    for (const v of result) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });

  it('sampleNoReplace throws when k > n', () => {
    expect(() => sampleNoReplace(3, 5)).toThrow();
  });

  it('sampleNoReplace is deterministic with injected rng', () => {
    const rngA = mulberry32(99).next;
    const rngB = mulberry32(99).next;
    expect(sampleNoReplace(20, 5, rngA)).toEqual(sampleNoReplace(20, 5, rngB));
  });

  it('reservoirSample size', () => {
    const result = reservoirSample([1, 2, 3, 4, 5], 3, mulberry32(2).next);
    expect(result).toHaveLength(3);
  });
});
