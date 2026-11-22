/**
 * Diversificação de jogos (E4) - greedy e Simulated Annealing.
 */

import type { IRandom } from '../rng';
import { type ProgressCallback, simulatedAnnealingDiversificacao } from './simulated-annealing';

export interface DiversificationResult {
  jogos: number[][];
  tentativas: number;
  aceitos: number;
}

function overlap(a: number[], b: number[]): number {
  const set = new Set(a);
  return b.filter((x) => set.has(x)).length;
}

export function diversifyGreedy(
  candidatos: number[][],
  q: number,
  _rng: IRandom,
  onProgress?: (phase: 'diversifying', current: number, total: number) => void,
): number[][] {
  if (candidatos.length <= q) return candidatos;

  const selecionados: number[][] = [candidatos[0]!];
  const restantes = candidatos.slice(1);

  // Progress para diversificação
  onProgress?.('diversifying', 1, q);

  while (selecionados.length < q && restantes.length > 0) {
    let melhorIdx = 0;
    let melhorMax = Number.POSITIVE_INFINITY;
    let melhorSoma = Number.POSITIVE_INFINITY;

    for (let i = 0; i < restantes.length; i++) {
      const cand = restantes[i]!;
      let maxOverlap = 0;
      let somaOverlap = 0;
      for (const sel of selecionados) {
        const ov = overlap(cand, sel);
        if (ov > maxOverlap) maxOverlap = ov;
        somaOverlap += ov;
      }
      if (maxOverlap < melhorMax || (maxOverlap === melhorMax && somaOverlap < melhorSoma)) {
        melhorMax = maxOverlap;
        melhorSoma = somaOverlap;
        melhorIdx = i;
      }
    }

    const escolhido = restantes.splice(melhorIdx, 1)[0]!;
    selecionados.push(escolhido);
    onProgress?.('diversifying', selecionados.length, q);
  }

  return selecionados;
}

export function diversifyWithSA(
  candidatos: number[][],
  q: number,
  rng: IRandom,
  usarSA: boolean,
  onProgress?: ProgressCallback,
): number[][] {
  if (!usarSA || candidatos.length < q) {
    return diversifyGreedy(candidatos, q, rng);
  }

  return simulatedAnnealingDiversificacao(candidatos, q, () => rng.next(), onProgress);
}
