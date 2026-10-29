/**
 * F11 — Filtros de equilíbrio de combinações.
 */

export interface FiltroResultado {
  dezenas: number[];
  soma: number;
  somaQuadrados: number;
  pares: number;
  impares: number;
  atraso: number;
}

function combBigInt(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  const kk = Math.min(k, n - k);
  let r = 1n;
  for (let i = 1; i <= kk; i++) r = (r * BigInt(n - kk + i)) / BigInt(i);
  return r;
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

function hypergeometricCdf(M: number, K: number, n: number, h: number): number {
  const total = combBigInt(M, n);
  if (total === 0n) return 0;
  let cum = 0n;
  const hi = Math.min(h, Math.min(K, n));
  for (let i = 0; i <= hi; i++) {
    cum += combBigInt(K, i) * combBigInt(M - K, n - i);
  }
  return Number(cum) / Number(total);
}

export function filtrosEquilibrio(N: number, k: number) {
  const M = N;
  const K = evensCount(N);
  const n = k;

  let paresMin = 0;
  for (let h = 0; h <= n; h++) {
    if (hypergeometricCdf(M, K, n, h) > 0.1) {
      paresMin = h;
      break;
    }
  }
  let paresMax = n;
  for (let h = n; h >= 0; h--) {
    const surv = 1 - hypergeometricCdf(M, K, n, h - 1);
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
  const z = 1.2816;
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
