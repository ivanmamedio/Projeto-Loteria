/**
 * Fórmulas F1–F3 — Probabilidade básica.
 * Referência: tasks_loteria.md — F1–F3 (BigInt)
 *
 * Todo: usa BigInt para combinações exatas (não perde precisão com números
 * grandes, como C(100, 20) em Lotomania).
 */

// F1: n! (fatorial)
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
  if (k < 0n || k > n) return 0n;
  if (k === 0n || k === n) return 1n;

  // Otimização: C(n, k) = C(n, n - k) — escolhe o menor fatorial
  const kMin = k < n - k ? k : n - k;

  let numerador = 1n;
  let denominador = 1n;
  for (let i = 0n; i < kMin; i++) {
    numerador *= n - i;
    denominador *= i + 1n;
    // Simplificar a fração a cada passo para manter os números menores
    const mcd = gcd(numerador, denominador);
    numerador /= mcd;
    denominador /= mcd;
  }
  return numerador / denominador;
}

// F2: Probabilidade de acerto exato (1 / C(n, k))
export function probabilidadeAcerto(exatos: bigint, total: bigint): number {
  const combinacoes = combina(total, exatos);
  if (combinacoes === 0n) return 0;
  return 1 / Number(combinacoes);
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

  let acumulado = 0;
  const inicio = Number(k);
  const fim = Number(maxAcertos);

  for (let i = inicio; i <= fim; i++) {
    const termo = Number(combina(K, BigInt(i)) * combina(N - K, n - BigInt(i))) / Number(total);
    acumulado += termo;
  }

  return acumulado;
}

// Cálculo de MDC (algoritmo de Euclides)
function gcd(a: bigint, b: bigint): bigint {
  let x = a;
  let y = b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}
// Spec-aligned helpers (reference implementation from tasks_loteria.md §5.6)
export function comb(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  const kk = Math.min(k, n - k);
  let r = 1n;
  for (let i = 1; i <= kk; i++) r = (r * BigInt(n - kk + i)) / BigInt(i);
  return r;
}

export function oneIn(M: number, d: number, n: number, h: number): bigint {
  const ways = comb(n, h) * comb(M - n, d - h);
  return ways === 0n ? 0n : comb(M, d) / ways;
}
