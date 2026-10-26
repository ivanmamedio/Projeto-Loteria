/**
 * F12 — Diversificação do lote.
 */

import { type IRandom, mulberry32, newSeed } from './rng';
import { sampleNoReplace } from './sampling';

export interface DezenaInfo {
  dezena: number;
  peso: number;
  atraso: number;
}

export interface DiversidadeParams {
  numeroDezenas: number;
  numeroJogos: number;
  beta: number;
  alfa: number;
  lambda: number;
}

function sortGame(game: number[]): number[] {
  return [...game].sort((a, b) => a - b);
}

function gameKey(game: number[]): string {
  return sortGame(game).join(',');
}

function overlap(a: number[], b: number[]): number {
  const set = new Set(a);
  return b.filter((x) => set.has(x)).length;
}

export function gerarLote(
  universo: number[],
  _dezenasFrequencia: Record<number, number>,
  _dezenasAtraso: Record<number, number>,
  params: DiversidadeParams = {
    numeroDezenas: 6,
    numeroJogos: 3,
    beta: 1.0,
    alfa: 0.0,
    lambda: 30,
  },
  rng: IRandom = mulberry32(newSeed()),
): number[][] {
  const { numeroDezenas, numeroJogos } = params;
  const k = Math.min(numeroDezenas, universo.length);
  const totalCandidatos = Math.max(30, 20 * numeroJogos);

  const rngFn = () => rng.next();

  const candidatos: number[][] = [];
  const vistos = new Set<string>();
  let tentativas = 0;
  while (candidatos.length < totalCandidatos && tentativas < totalCandidatos * 5) {
    tentativas++;
    const indices = sampleNoReplace(universo.length, k, rngFn);
    const jogo = sortGame(indices.map((i) => universo[i] as number));
    const chave = gameKey(jogo);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    candidatos.push(jogo);
  }

  if (candidatos.length === 0) return [];

  const selecionados: number[][] = [candidatos[0] as number[]];
  const restantes = candidatos.slice(1);

  while (selecionados.length < numeroJogos && restantes.length > 0) {
    let melhorIdx = 0;
    let melhorMax = Number.POSITIVE_INFINITY;
    let melhorSoma = Number.POSITIVE_INFINITY;

    for (let i = 0; i < restantes.length; i++) {
      const cand = restantes[i] as number[];
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

    const escolhido = restantes.splice(melhorIdx, 1)[0] as number[];
    selecionados.push(escolhido);
  }

  return selecionados;
}
