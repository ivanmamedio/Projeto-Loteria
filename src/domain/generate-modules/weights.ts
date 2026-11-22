/**
 * Cálculo de pesos para as dezenas (E1, E2, patterns).
 */

import { patternWeights } from '../patterns';
import type { ModalidadeRegras } from '../rules';
import { atrasoAcumulado, frequenciaDezenas } from '../stats';
import { atrasoWeights, frequencyWeights } from '../weights';

export interface WeightCalculationResult {
  weights: number[];
  freqRec: Record<number, number>;
  atrasoDe: (d: number) => number;
}

export function calculateWeights(
  dezenasValidas: number[],
  modalidade: ModalidadeRegras,
  windowed: number[][],
  opcoes: Record<string, unknown>,
  usarE0: boolean,
  usarE1: boolean,
  usarE2: boolean,
  beta: number,
  _evitaCal: boolean,
  usarBMA: boolean,
): WeightCalculationResult {
  const freqRec = windowed.length > 0 ? frequenciaDezenas(windowed) : {};
  const atrasoDe = (d: number) => (windowed.length > 0 ? atrasoAcumulado(windowed, d) : 0);

  const freqArr = dezenasValidas.map((d) => freqRec[d] ?? 0);
  const atrasoArr = dezenasValidas.map((d) => atrasoDe(d));

  const freqOverride = opcoes?.frequencias ?? opcoes?.frequencies ?? opcoes?.freq ?? opcoes?.f;
  const atrasoOverride = opcoes?.atrasos ?? opcoes?.delays ?? opcoes?.atraso ?? opcoes?.a;
  const pesosOverride = opcoes?.pesos ?? opcoes?.weights ?? opcoes?.w;

  const toNumberArray = (v: unknown, byDezena: boolean): number[] => {
    if (Array.isArray(v)) {
      if (v.length === dezenasValidas.length) return v.map((x) => Number(x));
      if (byDezena) return dezenasValidas.map((d) => Number((v as unknown[])[d] ?? 0));
      return dezenasValidas.map((_, i) => Number((v as unknown[])[i] ?? 0));
    }
    if (v && typeof v === 'object') {
      const obj = v as Record<string, unknown>;
      return dezenasValidas.map((d) => Number(obj[d] ?? obj[String(d)] ?? 0));
    }
    return dezenasValidas.map(() => 0);
  };

  if (freqOverride !== undefined) {
    const arr = toNumberArray(freqOverride, true);
    for (let i = 0; i < dezenasValidas.length; i++) {
      freqArr[i] = arr[i] ?? 0;
    }
  }
  if (atrasoOverride !== undefined) {
    const arr = toNumberArray(atrasoOverride, true);
    for (let i = 0; i < dezenasValidas.length; i++) {
      atrasoArr[i] = arr[i] ?? 0;
    }
  }

  let weights = dezenasValidas.map(() => 1);
  if (pesosOverride !== undefined) {
    const arr = toNumberArray(pesosOverride, false);
    weights = dezenasValidas.map((_, i) =>
      Number.isFinite(arr[i] ?? Number.NaN) ? (arr[i] as number) : 1,
    );
  }

  if (usarE1) {
    const w = frequencyWeights(freqArr, beta);
    weights = weights.map((x, i) => x * (w[i] ?? 1));
  }
  if (usarE2) {
    const w = atrasoWeights(atrasoArr, beta);
    weights = weights.map((x, i) => x * (w[i] ?? 1));
  }
  if (!usarE1 && !usarE2 && usarE0) {
    weights = dezenasValidas.map(() => 1);
  }

  // Análise de padrões (aplicada quando há histórico e não é E0)
  if (windowed.length > 0 && !usarE0) {
    const fibIntensidade = opcoes?.fibonacciIntensidade
      ? typeof opcoes.fibonacciIntensidade === 'number'
        ? opcoes.fibonacciIntensidade
        : Number(opcoes.fibonacciIntensidade)
      : beta;
    const pw = patternWeights(
      {
        historico: windowed,
        universo: modalidade.universo,
        dezenasValidas,
        k: modalidade.dezenasSorteadas,
        fibonacciIntensidade: fibIntensidade,
      },
      usarBMA,
    );
    weights = weights.map((x, i) => x * (pw[i] ?? 1));
  }

  return { weights, freqRec, atrasoDe };
}
