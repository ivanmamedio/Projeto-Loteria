import { describe, expect, it } from 'vitest';

import {
  atrasoAcumulado,
  frequenciaDezenas,
  quiQuadrado,
  valorZ,
  varianciaSomaDezenas,
} from './stats';

describe('stats', () => {
  it('frequenciaDezenas counts occurrences', () => {
    const freq = frequenciaDezenas([[1, 2], [2, 3], [1]]);
    expect(freq).toEqual({ 1: 2, 2: 2, 3: 1 });
  });

  it('atrasoAcumulado returns 0 for empty-ish input', () => {
    expect(atrasoAcumulado([], 1)).toBe(0);
  });

  it('valorZ returns 0 when std is 0', () => {
    expect(valorZ(5, 3, 0)).toBe(0);
    expect(valorZ(5, 3, 2)).toBe(1);
  });

  it('quiQuadrado returns finite non-negative chi2', () => {
    const result = quiQuadrado(
      [
        [1, 2],
        [2, 3],
      ],
      4,
    );
    expect(result.chi2).toBeGreaterThanOrEqual(0);
    expect(result.graus).toBe(3);
    expect(result.pValor).toBeGreaterThanOrEqual(0);
    expect(result.pValor).toBeLessThanOrEqual(1);
  });

  it('varianciaSomaDezenas handles single record', () => {
    expect(varianciaSomaDezenas([[1, 2, 3]], 10)).toBe(0);
  });
});
