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
export function frequenciaPonderada(dezenas: number[], beta = 1.0): Record<number, number> {
  if (dezenas.length === 0) return {};

  const contagem: Record<number, number> = {};

  for (const d of dezenas) {
    contagem[d] = (contagem[d] ?? 0) + 1;
  }

  const freqs = Object.values(contagem);
  const media = freqs.reduce((a, b) => a + b, 0) / freqs.length;

  const peso: Record<number, number> = {};
  for (const [dezena, f] of Object.entries(contagem)) {
    const fNum = Number(f);
    const pesoV = ((fNum + 1) / (media + 1)) ** beta;
    peso[Number(dezena)] = pesoV;
  }

  return peso;
}

/**
 * F9: Atraso ponderado.
 * Quanto maior o atraso, maior o peso da dezena.
 *
 * • p_i = 1 / (1 + atraso_i / λ)      (hiperbólica)
 * • ou  p_i = β^(atraso_i)           (exponencial, β < 1)
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
