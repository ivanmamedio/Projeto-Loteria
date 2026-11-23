/**
 * F8–F9 — Frequência ponderada e atraso ponderado.
 * Referência: tasks_loteria.md — F8–F9
 */

export interface DezenaData {
  dezena: number;
  frequencia: number;
}

/**
 * F8: Frequência ponderada por quantidade de concursos.
 * Dada uma lista de frequências brutas, aplica um peso exponencial regressivo.
 *
 * w_i = ((f_i + 1) / (f̄ + 1))^β
 *
 * onde f_i é a frequência da dezena i, f̄ é a média das frequências e β é
 * o parâmetro de poder (default: 1.0).
 */
export function frequenciaPonderada(
  dezenas: number[],
  totalDezenas?: number,
  beta = 1.0,
): Record<number, number> {
  if (dezenas.length === 0) return {};

  const contagem: Record<number, number> = {};

  for (const d of dezenas) {
    contagem[d] = (contagem[d] ?? 0) + 1;
  }

  // Média sobre TODO o universo (incluindo dezenas que nunca saíram)
  // evita viés para cima em dezenas que já apareceram.
  const total = totalDezenas ?? dezenas.length;
  const somaFrequencias = dezenas.length;
  const media = somaFrequencias / total;

  const peso: Record<number, number> = {};
  for (const d of dezenasValidas(contagem)) {
    const fNum = contagem[d] ?? 0;
    const pesoV = ((fNum + 1) / (media + 1)) ** beta;
    peso[d] = pesoV;
  }

  return peso;
}

/** Retorna as dezenas distintas que apareceram no histórico. */
function dezenasValidas(contagem: Record<number, number>): number[] {
  return Object.keys(contagem).map(Number);
}

/**
 * F9: Atraso ponderado.
 * Quanto maior o atraso, MENOR o peso da dezena (função decrescente).
 *
 * • p_i = 1 / (1 + atraso_i / λ)      (hiperbólica, decrescente)
 * • ou  p_i = β^(atraso_i)           (exponencial decrescente, β < 1)
 */
export function atrasoPonderado(
  atrasos: Record<number, number>,
  method: 'hyperbolic' | 'exponential' = 'hyperbolic',
  lambda = 30,
  beta = 0.92,
): Record<number, number> {
  const peso: Record<number, number> = {};

  for (const [dezena, atraso] of Object.entries(atrasos)) {
    const a = Number(dezena);
    let p: number;

    if (method === 'hyperbolic') {
      p = 1 / (1 + atraso / lambda);
    } else {
      p = beta ** atraso;
    }

    peso[a] = p;
  }

  return peso;
}
// Spec-aligned helper (reference implementation from tasks_loteria.md §5.6)
export function frequencyWeights(f: readonly number[], beta: number): number[] {
  const mean = f.reduce((s, x) => s + x, 0) / f.length;
  return f.map((x) => ((x + 1) / (mean + 1)) ** beta);
}

// Spec-aligned helper for atraso weights
export function atrasoWeights(a: readonly number[], beta: number): number[] {
  const mean = a.reduce((s, x) => s + x, 0) / a.length;
  return a.map((x) => ((x + 1) / (mean + 1)) ** beta);
}
