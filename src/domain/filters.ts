/**
 * F11 — Filtros de equilíbrio de combinações.
 */

import { combCached } from './combinatorics';

export interface FiltroResultado {
  dezenas: number[];
  soma: number;
  somaQuadrados: number;
  pares: number;
  impares: number;
  atraso: number;
}

function minUniverso(N: number): number {
  return N === 100 ? 0 : 1;
}

function maxUniverso(N: number): number {
  return N === 100 ? 99 : N;
}

function evensCount(N: number): number {
  return Math.floor(N / 2);
}

/**
 * CDF Hipergeométrica exata usando BigInt (sem perda de precisão).
 * Retorna fração simplificada + valor decimal para compatibilidade.
 */
function hypergeometricCdfExact(
  M: number,
  K: number,
  n: number,
  h: number,
): { numerador: bigint; denominador: bigint; valor: number } {
  const total = combCached(M, n);
  if (total === 0n) return { numerador: 0n, denominador: 1n, valor: 0 };

  let cum = 0n;
  const hi = Math.min(h, Math.min(K, n));
  for (let i = 0; i <= hi; i++) {
    cum += combCached(K, i) * combCached(M - K, n - i);
  }

  // Para BigInt, usar gcd BigInt
  const gBig = gcdBigInt(cum, total);
  return {
    numerador: cum / gBig,
    denominador: total / gBig,
    valor: Number(cum) / Number(total),
  };
}

/** MDC para BigInt (copiado localmente para evitar dependência circular) */
function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a;
  let y = b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function filtrosEquilibrio(N: number, k: number) {
  const M = N;
  const K = evensCount(N);
  const n = k;

  // Encontrar paresMin: menor h tal que P(X <= h) > 0.1
  let paresMin = 0;
  for (let h = 0; h <= n; h++) {
    const cdf = hypergeometricCdfExact(M, K, n, h);
    if (cdf.valor > 0.1) {
      paresMin = h;
      break;
    }
  }

  // Encontrar paresMax: maior h tal que P(X >= h) > 0.1
  // P(X >= h) = 1 - P(X <= h-1)
  let paresMax = n;
  for (let h = n; h >= 0; h--) {
    const cdf = h === 0 ? { valor: 1 } : hypergeometricCdfExact(M, K, n, h - 1);
    const surv = 1 - cdf.valor;
    if (surv > 0.1) {
      paresMax = h;
      break;
    }
  }

  const min = minUniverso(N);
  const max = maxUniverso(N);
  const mediaTeorica = (k * (min + max)) / 2;
  const sigmaU2 = (N * N - 1) / 12;
  const variancia = (k * sigmaU2 * (N - k)) / (N - 1 || 1);
  const sigma = Math.sqrt(variancia);
  const z = 1.2816; // 80% intervalo bilateral
  const somaMin = Math.floor(mediaTeorica - z * sigma);
  const somaMax = Math.ceil(mediaTeorica + z * sigma);

  const somaQuadradosMin = k * min * min;
  const somaQuadradosMax = k * max * max;

  const numFaixas = Math.max(1, Math.ceil(N / 10));
  const maxPorFaixa = Math.ceil(k / numFaixas) + 1;

  return {
    somaMin,
    somaMax,
    somaQuadradosMin,
    somaQuadradosMax,
    paresMin,
    paresMax,
    imparesMin: k - paresMax,
    imparesMax: k - paresMin,
    maxPorFaixa,
  };
}

export function verificaFiltros(
  dezenas: number[],
  N: number,
  filtros = filtrosEquilibrio(N, dezenas.length),
) {
  const soma = dezenas.reduce((a, b) => a + b, 0);
  const somaQuadrados = dezenas.reduce((a, b) => a + b * b, 0);
  const pares = dezenas.filter((d) => d % 2 === 0).length;
  const impares = dezenas.length - pares;

  const passa =
    soma >= filtros.somaMin &&
    soma <= filtros.somaMax &&
    somaQuadrados >= filtros.somaQuadradosMin &&
    somaQuadrados <= filtros.somaQuadradosMax &&
    pares >= filtros.paresMin &&
    pares <= filtros.paresMax &&
    impares >= filtros.imparesMin &&
    impares <= filtros.imparesMax;

  return {
    passa,
    soma,
    somaQuadrados,
    pares,
    impares,
  };
}

/**
 * Filtro opcional: evitar padrão de calendário (muitas dezenas <= 31).
 * Desligado por padrão.
 */
export function evitaPadraoCalendario(dezenas: number[], limite = 0.6): boolean {
  if (dezenas.length === 0) return true;
  const pequenas = dezenas.filter((d) => d >= 1 && d <= 31).length;
  return pequenas / dezenas.length <= limite;
}
