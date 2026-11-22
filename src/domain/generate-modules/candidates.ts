/**
 * Geração de candidatos com amostragem ponderada.
 */

import type { IRandom } from '../rng';
import { sampleWeighted } from '../sampling';

export interface CandidateGenerationResult {
  candidatos: number[][];
  tentativas: number;
  aceitos: number;
}

export function generateCandidates(
  dezenasValidas: number[],
  weights: number[],
  tamanho: number,
  q: number,
  rng: IRandom,
  passaFiltros: (dezenas: number[]) => boolean,
  maxTentativas: number,
  onProgress?: (phase: 'candidates', current: number, total: number) => void,
): CandidateGenerationResult {
  const rngFn = () => rng.next();
  const jogos: number[][] = [];
  const usados = new Set<string>();
  let tentativas = 0;
  let aceitos = 0;
  let lastProgressUpdate = 0;

  const updateProgress = (current: number, total: number) => {
    const progress = Math.min(10 + Math.floor((current / total) * 80), 90);
    if (progress - lastProgressUpdate >= 5 || current === total) {
      lastProgressUpdate = progress;
      onProgress?.('candidates', current, total);
    }
  };

  while (jogos.length < q && tentativas < maxTentativas) {
    const cand = sampleWeighted(dezenasValidas, weights, tamanho, rngFn);
    tentativas++;
    if (!passaFiltros(cand)) {
      updateProgress(Math.min(tentativas, maxTentativas), maxTentativas);
      continue;
    }
    const chave = cand.join(',');
    if (usados.has(chave)) {
      updateProgress(Math.min(tentativas, maxTentativas), maxTentativas);
      continue;
    }
    usados.add(chave);
    aceitos++;
    jogos.push(cand);
    updateProgress(jogos.length, q);
  }

  return { candidatos: jogos, tentativas, aceitos };
}

export function generateCandidatePool(
  dezenasValidas: number[],
  weights: number[],
  tamanho: number,
  q: number,
  rng: IRandom,
  passaFiltros: (dezenas: number[]) => boolean,
  maxTentativas: number,
  onProgress?: (phase: 'candidates', current: number, total: number) => void,
): CandidateGenerationResult {
  const rngFn = () => rng.next();
  const candidatos: number[][] = [];
  const vistos = new Set<string>();
  let tentativas = 0;
  let aceitos = 0;
  let lastProgressUpdate = 0;

  const totalCandidatos = Math.max(50, 30 * q);

  const updateProgress = (current: number, total: number) => {
    const progress = Math.min(10 + Math.floor((current / total) * 80), 90);
    if (progress - lastProgressUpdate >= 5 || current === total) {
      lastProgressUpdate = progress;
      onProgress?.('candidates', current, total);
    }
  };

  while (candidatos.length < totalCandidatos && tentativas < maxTentativas) {
    const cand = sampleWeighted(dezenasValidas, weights, tamanho, rngFn);
    tentativas++;
    if (!passaFiltros(cand)) {
      updateProgress(Math.min(tentativas, maxTentativas), maxTentativas);
      continue;
    }
    const chave = cand.join(',');
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    candidatos.push(cand);
    aceitos++;
    updateProgress(candidatos.length, totalCandidatos);
  }

  return { candidatos, tentativas, aceitos };
}
