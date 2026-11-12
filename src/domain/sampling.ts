/**
 * F10 — Amostragem sem reposição com viés zero.
 * Referência: tasks_loteria.md — F10 (amostragem ponderada sem reposição)
 *
 * A amostragem usa floats em [0, 1) gerados por PRNG.
 * NUNCA usar Math.random() diretamente; o PRNG é injetado como parâmetro.
 */

import { mulberry32, newSeed } from './rng';

/**
 * Clamp seguro para evitar log(0) ou log(1)
 */
function safeRng(rng: () => number): number {
  const u = rng();
  // Mulberry32 retorna [0, 1), mas pode retornar 0 exatamente
  // Clamp para (0, 1) para log seguro
  if (u <= 0) return Number.MIN_VALUE;
  if (u >= 1) return 1 - Number.MIN_VALUE;
  return u;
}

/**
 * Amostragem sem reposição de `k` itens de `n` (índices 0..n-1) usando o
 * algoritmo de Fisher–Yates com probabilidade uniforme.
 *
 * @param n     Tamanho do universo (índices de 0 a n-1).
 * @param k     Quantidade de itens a extrair (k <= n).
 * @param rng   Função PRNG retornando [0, 1).
 * @returns     Índices sorteados, em ordem de sorteio.
 */
export function sampleNoReplace(
  n: number,
  k: number,
  rng: () => number = () => mulberry32(newSeed()).next(),
): number[] {
  if (k > n) throw new Error(`k (${k}) não pode ser maior que n (${n})`);
  if (k <= 0) return [];

  // Índices disponíveis — vetor simples para Fisher–Yates
  const indices = Array.from({ length: n }, (_, i) => i);

  const resultados: number[] = [];

  for (let i = n - 1; i >= n - k; i--) {
    const j = Math.floor(safeRng(rng) * (i + 1));
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
      const j = Math.floor(safeRng(rng) * (count + 1));
      if (j < k) {
        reservoir[j] = item;
      }
    }
    count++;
  }

  return reservoir;
}

/**
 * Amostragem ponderada sem reposição via algoritmo Efraimidis-Spirakis (2006).
 * Cada item i recebe key_i = -ln(U_i) / w_i onde U_i ~ Uniform(0,1).
 * Retorna os k itens com maiores keys.
 *
 * Complexidade: O(n log k) usando min-heap parcial, ou O(n log n) com sort.
 * Para k pequeno relativo a n, heap é mais eficiente.
 *
 * @param pool    Array de itens (números das dezenas)
 * @param weights Pesos positivos para cada item (mesmo tamanho de pool)
 * @param k       Quantidade a amostrar (k <= pool.length)
 * @param rng     PRNG retornando [0, 1)
 * @returns       k itens amostrados, ordenados ascendentemente
 */
export function sampleWeighted(
  pool: readonly number[],
  weights: readonly number[],
  k: number,
  rng: () => number,
): number[] {
  const n = pool.length;
  if (k >= n) return [...pool].sort((a, b) => a - b);
  if (k <= 0) return [];

  // Min-heap simples para top-k (manter menores keys no topo, substituir se maior)
  // Usamos array ordenado descendo por key (maior key = maior prioridade)
  const items: Array<{ n: number; key: number }> = [];

  for (let i = 0; i < n; i++) {
    const w = weights[i] ?? 1;
    if (w <= 0) continue; // Peso inválido = probabilidade zero
    const u = safeRng(rng);
    const key = -Math.log(u) / w; // Distribuição exponencial com rate = w

    if (items.length < k) {
      items.push({ n: pool[i], key });
      if (items.length === k) items.sort((a, b) => a.key - b.key); // min-heap: menor key no índice 0
    } else if (key > items[0].key) {
      items[0] = { n: pool[i], key };
      // Sift down para manter propriedade de min-heap
      let idx = 0;
      while (true) {
        const left = 2 * idx + 1;
        const right = 2 * idx + 2;
        let smallest = idx;
        if (left < k && items[left].key < items[smallest].key) smallest = left;
        if (right < k && items[right].key < items[smallest].key) smallest = right;
        if (smallest === idx) break;
        [items[idx], items[smallest]] = [items[smallest], items[idx]];
        idx = smallest;
      }
    }
  }

  // Extrair e ordenar por valor da dezena
  return items.map((x) => x.n).sort((a, b) => a - b);
}

/**
 * Versão simplificada com sort completo (O(n log n)) - mantida para compatibilidade
 * @deprecated Use sampleWeighted (heap-based) para melhor performance
 */
export function sampleWeightedSort(
  pool: readonly number[],
  weights: readonly number[],
  k: number,
  rng: () => number,
): number[] {
  return pool
    .map((n, i) => ({
      n,
      key: -Math.log(safeRng(rng)) / ((weights[i] ?? 1) || 1),
    }))
    .sort((a, b) => b.key - a.key)
    .slice(0, k)
    .map((x) => x.n)
    .sort((a, b) => a - b);
}
