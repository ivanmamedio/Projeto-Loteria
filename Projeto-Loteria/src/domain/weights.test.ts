import { describe, expect, it } from 'vitest';

import { atrasoPonderado, frequenciaPonderada } from './weights';

describe('weights', () => {
  it('frequenciaPonderada empty returns empty', () => {
    expect(frequenciaPonderada([])).toEqual({});
  });

  it('frequenciaPonderada returns one weight per distinct value', () => {
    const result = frequenciaPonderada([1, 1, 2]);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result[1]).toBeGreaterThan(result[2] ?? 0);
  });

  it('atrasoPonderado hyperbolic decreases with delay', () => {
    const result = atrasoPonderado({ 1: 0, 2: 30 }, 'hyperbolic', 30);
    expect(result[1]).toBeGreaterThan(result[2] ?? 0);
  });

  it('atrasoPonderado exponential', () => {
    const result = atrasoPonderado({ 1: 1 }, 'exponential', 30, 0.9);
    expect(result[1]).toBeCloseTo(0.9, 5);
  });
});
