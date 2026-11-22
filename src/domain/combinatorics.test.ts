import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearCombinatoricsCache,
  combCached,
  fatorialCached,
  fractionToDecimal,
  gcd,
  gcdNumber,
  getCacheStats,
  hipergeometricaAcumuladaExact,
  hipergeometricaPmfExact,
  probabilidadeAcertoExact,
  simplifyFraction,
} from './combinatorics';

describe('combinatorics', () => {
  beforeEach(() => {
    clearCombinatoricsCache();
  });

  describe('fatorialCached', () => {
    it('returns 1 for 0', () => {
      expect(fatorialCached(0)).toBe(1n);
    });

    it('returns correct values', () => {
      expect(fatorialCached(1)).toBe(1n);
      expect(fatorialCached(5)).toBe(120n);
      expect(fatorialCached(10)).toBe(3628800n);
    });

    it('uses cache on second call', () => {
      fatorialCached(10);
      const statsBefore = getCacheStats();
      fatorialCached(10);
      const statsAfter = getCacheStats();
      expect(statsAfter.factorial).toBe(statsBefore.factorial);
    });
  });

  describe('combCached', () => {
    it('returns 1 for C(n, 0) and C(n, n)', () => {
      expect(combCached(10, 0)).toBe(1n);
      expect(combCached(10, 10)).toBe(1n);
    });

    it('returns 0 for invalid k', () => {
      expect(combCached(5, 6)).toBe(0n);
      expect(combCached(5, -1)).toBe(0n);
    });

    it('returns correct binomial coefficients', () => {
      expect(combCached(5, 2)).toBe(10n); // C(5,2) = 10
      expect(combCached(6, 3)).toBe(20n); // C(6,3) = 20
      expect(combCached(60, 6)).toBe(50063860n); // Mega-Sena combinations
      expect(combCached(25, 15)).toBe(3268760n); // Lotofácil combinations
    });

    it('uses symmetry optimization C(n,k) = C(n,n-k)', () => {
      expect(combCached(10, 3)).toBe(combCached(10, 7));
    });

    it('uses cache on second call', () => {
      combCached(20, 5);
      const statsBefore = getCacheStats();
      combCached(20, 5);
      const statsAfter = getCacheStats();
      expect(statsAfter.comb).toBe(statsBefore.comb);
    });
  });

  describe('gcd', () => {
    it('returns correct GCD for BigInt', () => {
      expect(gcd(48n, 18n)).toBe(6n);
      expect(gcd(100n, 25n)).toBe(25n);
      expect(gcd(17n, 13n)).toBe(1n);
    });

    it('handles zero', () => {
      expect(gcd(0n, 5n)).toBe(5n);
      expect(gcd(5n, 0n)).toBe(5n);
    });
  });

  describe('gcdNumber', () => {
    it('returns correct GCD for number', () => {
      expect(gcdNumber(48, 18)).toBe(6);
      expect(gcdNumber(100, 25)).toBe(25);
      expect(gcdNumber(17, 13)).toBe(1);
    });
  });

  describe('simplifyFraction', () => {
    it('simplifies fractions', () => {
      expect(simplifyFraction(4n, 8n)).toEqual({ num: 1n, den: 2n });
      expect(simplifyFraction(10n, 15n)).toEqual({ num: 2n, den: 3n });
    });

    it('handles zero numerator', () => {
      expect(simplifyFraction(0n, 5n)).toEqual({ num: 0n, den: 1n });
    });

    it('handles zero denominator', () => {
      expect(simplifyFraction(5n, 0n)).toEqual({ num: 0n, den: 0n });
    });
  });

  describe('fractionToDecimal', () => {
    it('converts simple fractions', () => {
      expect(fractionToDecimal(1n, 2n)).toBe(
        '0.50000000000000000000000000000000000000000000000000',
      );
      expect(fractionToDecimal(1n, 4n)).toBe(
        '0.25000000000000000000000000000000000000000000000000',
      );
    });

    it('handles zero', () => {
      expect(fractionToDecimal(0n, 5n)).toBe(
        '0.00000000000000000000000000000000000000000000000000',
      );
    });

    it('handles improper fractions', () => {
      expect(fractionToDecimal(5n, 2n)).toBe(
        '2.50000000000000000000000000000000000000000000000000',
      );
    });

    it('handles precision parameter', () => {
      expect(fractionToDecimal(1n, 3n, 10)).toBe('0.3333333333');
    });
  });

  describe('probabilidadeAcertoExact', () => {
    it('returns exact probability for Mega-Sena', () => {
      const result = probabilidadeAcertoExact(6, 60);
      expect(result.numerador).toBe(1n);
      expect(result.denominador).toBe(50063860n);
      expect(result.decimal).toContain('0.0000000199');
    });

    it('returns exact probability for Lotofácil', () => {
      const result = probabilidadeAcertoExact(15, 25);
      expect(result.numerador).toBe(1n);
      expect(result.denominador).toBe(3268760n);
    });
  });

  describe('hipergeometricaPmfExact', () => {
    it('returns PMF for hypergeometric distribution', () => {
      // P(X=10) where N=25, K=15, n=15 (Lotofácil: 15 drawn, 15 marked, exactly 10 matches)
      // k=10 is valid: C(15,10) * C(10,5) / C(25,15)
      const result = hipergeometricaPmfExact(25, 15, 15, 10);
      expect(result.numerador).toBeGreaterThan(0n);
      expect(result.denominador).toBeGreaterThan(0n);
    });

    it('returns 0 for impossible values', () => {
      const result = hipergeometricaPmfExact(10, 5, 3, 4); // k > n
      expect(result.numerador).toBe(0n);
      expect(result.denominador).toBe(1n);
    });
  });

  describe('hipergeometricaAcumuladaExact', () => {
    it('returns cumulative probability P(X >= k)', () => {
      // At least 11 matches in Lotofácil
      const result = hipergeometricaAcumuladaExact(25, 15, 15, 11);
      expect(result.numerador).toBeGreaterThanOrEqual(0n);
      expect(result.denominador).toBeGreaterThan(0n);
    });

    it('returns 1 for k <= 0', () => {
      const result = hipergeometricaAcumuladaExact(25, 15, 15, 0);
      expect(result.numerador).toBe(1n);
      expect(result.denominador).toBe(1n);
    });

    it('returns 0 for impossible k', () => {
      const result = hipergeometricaAcumuladaExact(25, 15, 15, 20);
      expect(result.numerador).toBe(0n);
      expect(result.denominador).toBe(1n);
    });
  });

  describe('cache', () => {
    it('tracks cache stats', () => {
      clearCombinatoricsCache();
      combCached(10, 5);
      fatorialCached(10);
      const stats = getCacheStats();
      expect(stats.comb).toBeGreaterThan(0);
      expect(stats.factorial).toBeGreaterThan(0);
    });

    it('clears cache', () => {
      combCached(10, 5);
      clearCombinatoricsCache();
      const stats = getCacheStats();
      expect(stats.comb).toBe(0);
      expect(stats.factorial).toBe(0);
    });
  });
});
