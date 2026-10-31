import { describe, expect, it } from 'vitest';

import { combina, distribuicaHipergeometrica, fatorial, probabilidadeAcerto } from './probability';

describe('probability', () => {
  it('fatorial base cases', () => {
    expect(fatorial(0n)).toBe(1n);
    expect(fatorial(1n)).toBe(1n);
    expect(fatorial(5n)).toBe(120n);
    expect(fatorial(-1n)).toBe(0n);
  });

  it('combina symmetry and base cases', () => {
    expect(combina(5n, 0n)).toBe(1n);
    expect(combina(5n, 5n)).toBe(1n);
    expect(combina(5n, 2n)).toBe(combina(5n, 3n));
    expect(combina(5n, 2n)).toBe(10n);
    expect(combina(4n, 5n)).toBe(0n);
  });

  it('conference values', () => {
    expect(combina(60n, 6n)).toBe(50063860n);
    expect(combina(25n, 15n)).toBe(3268760n);
    expect(combina(80n, 5n)).toBe(24040016n);
  });

  it('probabilidadeAcerto for a certain combination', () => {
    expect(probabilidadeAcerto(2n, 2n)).toBe(1);
  });

  it('hypergeometric boundaries', () => {
    expect(distribuicaHipergeometrica(10n, 4n, 3n, 0n)).toBe(1);
    expect(distribuicaHipergeometrica(10n, 4n, 3n, 10n)).toBe(0);
  });
});
