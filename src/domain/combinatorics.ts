/**
 * Combinatória com cache e precisão arbitrária.
 * Referência: tasks_loteria.md — F1–F3 (BigInt)
 */

const combCache = new Map<string, bigint>();
const factorialCache = new Map<number, bigint>();

/** Limpa todos os caches (útil ao trocar modalidade em testes) */
export function clearCombinatoricsCache(): void {
  combCache.clear();
  factorialCache.clear();
}

/** Fatorial com memoização */
export function fatorialCached(n: number): bigint {
  if (n < 0) return 0n;
  if (n === 0) return 1n;
  if (factorialCache.has(n)) return factorialCache.get(n)!;

  let r = 1n;
  for (let i = 2n; i <= n; i++) r *= i;
  factorialCache.set(n, r);
  return r;
}

/** Coeficiente binomial C(n, k) com cache e otimização simétrica */
export function combCached(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  if (k === 0 || k === n) return 1n;

  const kk = Math.min(k, n - k);
  const key = `${n},${kk}`;
  if (combCache.has(key)) return combCache.get(key)!;

  let r = 1n;
  for (let i = 1; i <= kk; i++) {
    r = (r * BigInt(n - kk + i)) / BigInt(i);
  }
  combCache.set(key, r);
  return r;
}

/** Versão BigInt para compatibilidade com código existente */
export function combBigInt(n: bigint, k: bigint): bigint {
  if (k < 0n || k > n) return 0n;
  if (k === 0n || k === n) return 1n;

  const kMin = k < n - k ? k : n - k;
  let numerador = 1n;
  let denominador = 1n;
  for (let i = 0n; i < kMin; i++) {
    numerador *= n - i;
    denominador *= i + 1n;
    const g = gcd(numerador, denominador);
    numerador /= g;
    denominador /= g;
  }
  return numerador / denominador;
}

/** MDC de Euclides para BigInt */
export function gcd(a: bigint, b: bigint): bigint {
  let x = a;
  let y = b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/** MDC para number (usado em filtros) */
export function gcdNumber(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/** Simplifica fração BigInt */
export function simplifyFraction(num: bigint, den: bigint): { num: bigint; den: bigint } {
  if (den === 0n) return { num: 0n, den: 0n };
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

/** Probabilidade exata como fração + decimal high-precision */
export interface ProbabilityExact {
  numerador: bigint;
  denominador: bigint;
  decimal: string; // 50 casas decimais
}

/** Converte fração BigInt para decimal com precisão arbitrária */
export function fractionToDecimal(num: bigint, den: bigint, precision = 50): string {
  if (den === 0n) return 'NaN';
  if (num === 0n) return '0.' + '0'.repeat(precision);
  if (num >= den) {
    const intPart = num / den;
    const rem = num % den;
    const dec = fractionToDecimal(rem, den, precision);
    return intPart.toString() + dec.slice(1);
  }
  const scale = 10n ** BigInt(precision);
  const result = (num * scale) / den;
  return '0.' + result.toString().padStart(precision, '0');
}

/** Probabilidade de acerto exato: 1 / C(total, exatos) */
export function probabilidadeAcertoExact(exatos: number, total: number): ProbabilityExact {
  const c = combCached(total, exatos);
  const { num, den } = simplifyFraction(1n, c);
  return {
    numerador: num,
    denominador: den,
    decimal: fractionToDecimal(num, den),
  };
}

/** Distribuição hipergeométrica exata: P(X >= k) */
export function hipergeometricaAcumuladaExact(
  N: number,  // população
  K: number,  // sucessos na população
  n: number,  // tamanho da amostra
  k: number   // sucessos mínimos observados
): ProbabilityExact {
  if (k <= 0) return { numerador: 1n, denominador: 1n, decimal: '1' };
  const maxAcertos = Math.min(K, n);
  if (k > maxAcertos) return { numerador: 0n, denominador: 1n, decimal: '0' };

  const total = combCached(N, n);
  let numeradorAcumulado = 0n;

  for (let i = k; i <= maxAcertos; i++) {
    numeradorAcumulado += combCached(K, i) * combCached(N - K, n - i);
  }

  const { num, den } = simplifyFraction(numeradorAcumulado, total);
  return {
    numerador: num,
    denominador: den,
    decimal: fractionToDecimal(num, den),
  };
}

/** PMF hipergeométrica exata: P(X = k) */
export function hipergeometricaPmfExact(
  N: number, K: number, n: number, k: number
): ProbabilityExact {
  if (k < 0 || k > Math.min(K, n)) return { numerador: 0n, denominador: 1n, decimal: '0' };
  const total = combCached(N, n);
  const numerador = combCached(K, k) * combCached(N - K, n - k);
  const { num, den } = simplifyFraction(numerador, total);
  return { numerador: num, denominador: den, decimal: fractionToDecimal(num, den) };
}

/** Estatísticas da cache (para debug/monitoramento) */
export function getCacheStats(): { comb: number; factorial: number } {
  return { comb: combCache.size, factorial: factorialCache.size };
}