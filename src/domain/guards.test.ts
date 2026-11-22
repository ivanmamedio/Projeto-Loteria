import { describe, expect, it } from 'vitest';

import {
  sanitizarDezenas,
  validarDezenasUniverso,
  validarHistorico,
  validarJogoGerado,
  validarParametrosGeracao,
} from './guards';

describe('guards', () => {
  describe('validarDezenasUniverso', () => {
    it('passes for valid dezenas in Mega-Sena', () => {
      const result = validarDezenasUniverso('mega-sena', [1, 2, 3, 4, 5, 6]);
      expect(result.valido).toBe(true);
    });

    it('fails for dezena below minimum', () => {
      const result = validarDezenasUniverso('mega-sena', [0, 2, 3, 4, 5, 6]);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('fora do universo');
    });

    it('fails for dezena above maximum', () => {
      const result = validarDezenasUniverso('mega-sena', [1, 2, 3, 4, 5, 61]);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('fora do universo');
    });

    it('fails for duplicate dezenas', () => {
      const result = validarDezenasUniverso('mega-sena', [1, 2, 3, 4, 5, 5]);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('duplicadas');
    });

    it('works for Lotomania (0-99)', () => {
      const result = validarDezenasUniverso('lotomania', [0, 1, 2, 99]);
      expect(result.valido).toBe(true);
    });
  });

  describe('validarHistorico', () => {
    it('passes for valid history', () => {
      const hist = [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
      ];
      const result = validarHistorico(hist, 'mega-sena');
      expect(result.valido).toBe(true);
    });

    it('fails for wrong draw size', () => {
      const hist = [
        [1, 2, 3, 4, 5], // só 5 dezenas
      ];
      const result = validarHistorico(hist, 'mega-sena');
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('6');
    });

    it('fails for duplicate in draw', () => {
      const hist = [[1, 2, 3, 4, 5, 5]];
      const result = validarHistorico(hist, 'mega-sena');
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('duplicadas');
    });

    it('fails for dezena out of range', () => {
      const hist = [[1, 2, 3, 4, 5, 61]];
      const result = validarHistorico(hist, 'mega-sena');
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('fora do universo');
    });

    it('passes for empty history', () => {
      const result = validarHistorico([], 'mega-sena');
      expect(result.valido).toBe(true);
    });
  });

  describe('validarParametrosGeracao', () => {
    it('passes for valid params', () => {
      const result = validarParametrosGeracao('mega-sena', [1, 2, 3, 4, 5, 6, 7, 8], 6, 3);
      expect(result.valido).toBe(true);
    });

    it('fails for too few dezenas', () => {
      const result = validarParametrosGeracao('mega-sena', [1, 2, 3], 6, 3);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('Mínimo');
    });

    it('fails for too many dezenas', () => {
      const result = validarParametrosGeracao(
        'mega-sena',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
        6,
        3,
      );
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('Máximo');
    });

    it('fails for invalid bet size', () => {
      const result = validarParametrosGeracao('mega-sena', [1, 2, 3, 4, 5, 6, 7, 8], 25, 3);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('Tamanho de aposta');
    });

    it('fails for bet size > marked dezenas', () => {
      const result = validarParametrosGeracao('mega-sena', [1, 2, 3, 4, 5, 6], 10, 3);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('maior que dezenas marcadas');
    });

    it('fails for invalid quantidade', () => {
      const result = validarParametrosGeracao('mega-sena', [1, 2, 3, 4, 5, 6, 7, 8], 6, 15);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('Quantidade');
    });
  });

  describe('sanitizarDezenas', () => {
    it('removes non-numbers', () => {
      // null -> Number(null) = 0 (integer, kept)
      // undefined -> Number(undefined) = NaN (filtered)
      // 'abc' -> NaN (filtered)
      // '2' -> 2 (kept)
      const result = sanitizarDezenas([1, '2', 3, 'abc', null, undefined, 4]);
      expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it('removes NaN and Infinity', () => {
      const result = sanitizarDezenas([
        1,
        Number.NaN,
        2,
        Number.POSITIVE_INFINITY,
        3,
        Number.NEGATIVE_INFINITY,
        4,
      ]);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('removes duplicates and sorts', () => {
      const result = sanitizarDezenas([5, 1, 3, 1, 5, 2]);
      expect(result).toEqual([1, 2, 3, 5]);
    });

    it('filters out non-integers (floats)', () => {
      // 1.7, 2.3, 3.9 are not integers -> filtered out
      const result = sanitizarDezenas([1.7, 2.3, 3.9]);
      expect(result).toEqual([]);
    });

    it('keeps integer floats', () => {
      // 1.0, 2.0, 3.0 are integers -> kept
      const result = sanitizarDezenas([1.0, 2.0, 3.0]);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('validarJogoGerado', () => {
    it('passes for valid Mega-Sena game', () => {
      const result = validarJogoGerado([1, 2, 3, 4, 5, 6], 'mega-sena');
      expect(result).toBe(true);
    });

    it('fails for wrong size', () => {
      const result = validarJogoGerado([1, 2, 3, 4, 5], 'mega-sena');
      expect(result).toBe(false);
    });

    it('fails for out of range', () => {
      const result = validarJogoGerado([1, 2, 3, 4, 5, 61], 'mega-sena');
      expect(result).toBe(false);
    });

    it('fails for duplicates', () => {
      const result = validarJogoGerado([1, 2, 3, 4, 5, 5], 'mega-sena');
      expect(result).toBe(false);
    });
  });
});
