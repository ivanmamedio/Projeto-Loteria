/**
 * Fórmulas F1–F3 — Probabilidade básica.
 * Referência: tasks_loteria.md — F1–F3 (BigInt)
 *
 * Todo: usa BigInt para combinações exatas (não perde precisão com números
 * grandes, como C(100, 20) em Lotomania).
 */

import {
  type ProbabilityExact,
  combBigInt,
  combCached,
  gcd,
  hipergeometricaAcumuladaExact,
  hipergeometricaPmfExact,
  probabilidadeAcertoExact,
} from './combinatorics';

// F1: n! (fatorial) - mantido para compatibilidade
export function fatorial(n: bigint): bigint {
  if (n < 0n) return 0n;
  if (n === 0n) return 1n;
  let r = 1n;
  for (let i = 2n; i <= n; i++) {
    r *= i;
  }
  return r;
}

// F1: C(n, k) — coeficiente binomial (n! / (k! * (n - k)!))
export function combina(n: bigint, k: bigint): bigint {
  return combBigInt(n, k);
}

// F2: Probabilidade de acerto exato (1 / C(n, k)) - versão number para compatibilidade
export function probabilidadeAcerto(exatos: bigint, total: bigint): number {
  const combinacoes = combina(total, exatos);
  if (combinacoes === 0n) return 0;
  return 1 / Number(combinacoes);
}

// Nova: versão exata com alta precisão
export function probabilidadeAcertoHighPrecision(exatos: number, total: number): ProbabilityExact {
  return probabilidadeAcertoExact(exatos, total);
}

// F3: Probabilidade de pelo menos k acertos em n tentativas (aproximação)
// F3 usa soma de distribuição hipergeométrica:
// P(X >= k) = Σ C(K, i) * C(N-K, n-i) / C(N, n)
export function distribuicaHipergeometrica(N: bigint, K: bigint, n: bigint, k: bigint): number {
  if (k <= 0n) return 1;
  const maxAcertos = K < n ? K : n;
  if (k > maxAcertos) return 0;

  const total = combina(N, n);
  if (total === 0n) return 0;

  let numeradorAcumulado = 0n;
  const inicio = Number(k);
  const fim = Number(maxAcertos);

  for (let i = inicio; i <= fim; i++) {
    const termoNumerador = combina(K, BigInt(i)) * combina(N - K, n - BigInt(i));
    numeradorAcumulado += termoNumerador;
  }

  // Divide apenas no final para preservar precisão
  return Number(numeradorAcumulado) / Number(total);
}

// Nova: versão exata com alta precisão
export function distribuicaHipergeometricaHighPrecision(
  N: number,
  K: number,
  n: number,
  k: number,
): ProbabilityExact {
  return hipergeometricaAcumuladaExact(N, K, n, k);
}

// Nova: PMF hipergeométrica exata P(X = k)
export function hipergeometricaPmfHighPrecision(
  N: number,
  K: number,
  n: number,
  k: number,
): ProbabilityExact {
  return hipergeometricaPmfExact(N, K, n, k);
}

// Cálculo de MDC (algoritmo de Euclides) - exportado para compatibilidade
export function gcdBigInt(a: bigint, b: bigint): bigint {
  return gcd(a, b);
}

// Spec-aligned helpers (reference implementation from tasks_loteria.md §5.6)
export function comb(n: number, k: number): bigint {
  return combCached(n, k);
}

export function oneIn(M: number, d: number, n: number, h: number): bigint {
  const ways = comb(n, h) * comb(M - n, d - h);
  return ways === 0n ? 0n : comb(M, d) / ways;
}

// Exporta tipos para consumidores
export type { ProbabilityExact };
