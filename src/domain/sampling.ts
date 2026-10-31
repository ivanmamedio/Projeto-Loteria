/**
 * F10 — Amostragem sem reposição com viés zero.
 * Referência: tasks_loteria.md — F10 (amostragem ponderada sem reposição)
 *
 * A amostragem usa floats em [0, 1) gerados por PRNG.
 * NUNCA usar Math.random() diretamente; o PRNG é injetado como parâmetro.
 */

import { mulberry32, newSeed } from './rng';

/**
 * Amostragem sem reposição de `k` itens de `n` (índices 0..n-1) usando o
 * algoritmo de Fisher–Yates (ou algoritmo de reservoir sampling) com
 * probabilidade uniforme.
 *
 * @param n     Tamanho do universo (índices de 0 a n-1).
 * @param k     Quantidade de itens a extrair (k <= n).
 * @param rng   Semente de PRNG (opcional; gera uma interna se omitida).
 * @returns     Índices sorteados, em ordem de sorteio.
 */
export function sampleNoReplace(
  n: number,
  k: number,
  rng: () => number = () => mulberry32(newSeed()).next(),
): number[] {
  if (k > n) throw new Error(`k (${k}) não pode ser maior que n (${n})`);

  // Índices disponíveis — vetor simples para Fisher–Yates
  const indices = Array.from({ length: n }, (_, i) => i);

  const resultados: number[] = [];

  for (let i = n - 1; i >= n - k; i--) {
    const j = Math.floor(rng() * (i + 1));
    const iVal = indices[i];
    const jVal = indices[j];
    if (iVal === undefined || jVal === undefined) continue;
    indices[i] = jVal;
    indices[j] = iVal;
    resultados.push(jVal);
  }

  return resultados;
}

/**
 * Algoritmo de reservoir sampling (para streaming, quando `n` desconhecido
 * ou muito grande).
 */
export function reservoirSample<T>(
  it: Iterable<T>,
  k: number,
  rng: () => number = () => mulberry32(newSeed()).next(),
): T[] {
  const reservoir: T[] = [];
  let count = 0;

  for (const item of it) {
    if (count < k) {
      reservoir.push(item);
    } else {
      const j = Math.floor(rng() * (count + 1));
      if (j < k) {
        reservoir[j] = item;
      }
    }
    count++;
  }

  return reservoir;
}
// Spec-aligned helper (reference implementation from tasks_loteria.md §5.6)
export function sampleWeighted(
  pool: readonly number[],
  weights: readonly number[],
  k: number,
  rng: () => number,
): number[] {
  return pool
    .map((n, i) => ({ n, key: Math.log(rng() || Number.MIN_VALUE) / ((weights[i] ?? 1) || 1) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, k)
    .map((x) => x.n)
    .sort((a, b) => a - b);
}
