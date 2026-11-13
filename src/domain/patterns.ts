/**
 * Análise de padrões baseada em teorias_analise_padroes.md.
 */
export interface PatternContext {
  historico: number[][];
  universo: number;
  dezenasValidas: number[];
  k: number;
  /** Intensidade do bias Fibonacci (0.5=suave, 1=médio, 2=forte). Default: 1 */
  fibonacciIntensidade?: number;
}

import { fibonacciFromOne } from './fibonacci';

function zeros(n: number): number[] {
  return new Array(n).fill(0);
}
function minUniv(universo: number): number {
  return universo === 100 ? 0 : 1;
}

export function coocorrenciaMatriz(historico: number[][], universo: number): number[][] {
  const min = minUniv(universo);
  const offset = min;
  const M = universo;
  const mat = Array.from({ length: M }, () => zeros(M));
  for (const sorteio of historico) {
    const dez = sorteio.filter((d) => d >= offset && d < offset + M);
    for (let i = 0; i < dez.length; i++) {
      for (let j = i + 1; j < dez.length; j++) {
        const a = (dez[i] as number) - offset;
        const b = (dez[j] as number) - offset;
        const rowA = mat[a];
        const rowB = mat[b];
        if (rowA) rowA[b] = (rowA[b] ?? 0) + 1;
        if (rowB) rowB[a] = (rowB[a] ?? 0) + 1;
      }
    }
  }
  return mat;
}

export function pmiMatriz(historico: number[][], universo: number): number[][] {
  const min = minUniv(universo);
  const offset = min;
  const M = universo;
  const N = historico.length || 1;
  // marginais
  const marg = new Array(M).fill(0);
  const conj = Array.from({ length: M }, () => new Array(M).fill(0));
  for (const sorteio of historico) {
    const dez = sorteio.filter((d) => d >= min && d < min + M);
    for (const d of dez) marg[d - offset]++;
    for (let i = 0; i < dez.length; i++) {
      for (let j = i + 1; j < dez.length; j++) {
        const a = (dez[i] as number) - offset;
        const b = (dez[j] as number) - offset;
        const rowA = conj[a];
        const rowB = conj[b];
        if (rowA) rowA[b] = (rowA[b] ?? 0) + 1;
        if (rowB) rowB[a] = (rowB[a] ?? 0) + 1;
      }
    }
  }
  const mat = Array.from({ length: M }, () => new Array(M).fill(0));
  const eps = 1e-12;
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < M; j++) {
      if (i === j) {
        const r = mat[i];
        if (r) r[j] = 0;
        continue;
      }
      const conjRow = conj[i];
      const pij = ((conjRow ? conjRow[j] : 0) ?? 0) / (N + eps);
      const pi = (marg[i] ?? 0) / (N + eps) + eps;
      const pj = (marg[j] ?? 0) / (N + eps) + eps;
      const pmi = Math.log((pij + eps) / (pi * pj + eps));
      const matRow = mat[i];
      if (matRow) matRow[j] = Math.max(0, pmi);
    }
  }
  return mat;
}

function frequenciaLocal(historico: number[][], universo: number): number[] {
  const min = minUniv(universo);
  const offset = min;
  const cont = new Array(universo).fill(0);
  for (const sorteio of historico) {
    for (const d of sorteio) {
      if (d >= min && d < min + universo) cont[d - offset]++;
    }
  }
  return cont;
}

/**
 * Normaliza array de pesos para média 1 (compatibilidade com código existente)
 */
function normalizeWeights(weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => 1);
  return weights.map((w) => (w * n) / sum);
}

export function coocorrenciaPesos(ctx: PatternContext): number[] {
  const { historico, universo, dezenasValidas } = ctx;
  const min = minUniv(universo);
  const offset = min;
  const mat = pmiMatriz(historico, universo);
  const pesos = dezenasValidas.map((d) => {
    const idx = d - offset;
    const row = mat[idx];
    if (!row) return 1;
    const forca = row.reduce((a, b) => a + b, 0);
    return 1 + forca / Math.max(1, dezenasValidas.length);
  });
  return normalizeWeights(pesos);
}

export function slidingWindowPesos(ctx: PatternContext): number[] {
  const { historico, universo, dezenasValidas } = ctx;
  if (historico.length < 2) return dezenasValidas.map(() => 1);
  const janela = Math.max(5, Math.floor(historico.length * 0.2));
  const recente = historico.slice(-janela);
  const antigo = historico.slice(0, Math.max(1, historico.length - janela));
  const freqRecente = frequenciaLocal(recente, universo);
  const freqAntiga = frequenciaLocal(antigo, universo);
  const min = minUniv(universo);
  const offset = min;
  const pesos = dezenasValidas.map((d) => {
    const idx = d - offset;
    const fr = freqRecente[idx] ?? 0;
    const fa = freqAntiga[idx] ?? 0;
    const tendencia = (fr + 1) / (fa + 1);
    return Math.sqrt(Math.max(0.1, tendencia));
  });
  return normalizeWeights(pesos);
}

export function energiaPesos(ctx: PatternContext): number[] {
  const { historico, universo, dezenasValidas } = ctx;
  const min = minUniv(universo);
  const offset = min;
  const M = universo;
  const freq = frequenciaLocal(historico, universo);
  const total = freq.reduce((a, b) => a + b, 0) || 1;
  // Acoplamento J a partir de PMI (Hamiltoniano H = sum J_ij s_i s_j)
  const J = pmiMatriz(historico, universo);
  const atrasos = dezenasValidas.map((d) => {
    let ultimo = -1;
    for (let i = 0; i < historico.length; i++) {
      if (historico[i]?.includes(d)) ultimo = i;
    }
    if (ultimo === -1) return historico.length;
    return historico.length - 1 - ultimo;
  });
  const pesos = dezenasValidas.map((d, i) => {
    const idx = d - offset;
    const f = (freq[idx] ?? 0) / total;
    const a = atrasos[i] ?? 0;
    // energia da dezena: acoplamento com dezenas frequentes + atraso + entropia
    let acopl = 0;
    const row = J[idx];
    if (row) {
      for (let j = 0; j < M; j++) {
        const fj = (freq[j] ?? 0) / total;
        acopl += (row[j] ?? 0) * fj;
      }
    }
    const energia = -Math.log(f + 1e-6) + a / Math.max(1, historico.length) - acopl;
    // free energy: U - T*S (T=1) -> peso = exp(-energia)
    return Math.exp(-energia);
  });
  return normalizeWeights(pesos);
}

export function markovPesos(ctx: PatternContext): number[] {
  const { historico, universo, dezenasValidas } = ctx;
  if (historico.length < 2) return dezenasValidas.map(() => 1);
  const ultimo = historico[historico.length - 1] ?? [];
  const paresUltimo = ultimo.filter((d) => d % 2 === 0).length;
  const transicao = new Array(universo).fill(0);
  let totalTrans = 0;
  const min = minUniv(universo);
  const offset = min;
  for (let i = 0; i < historico.length - 1; i++) {
    const atual = historico[i] ?? [];
    const prox = historico[i + 1] ?? [];
    const paresAtual = atual.filter((d) => d % 2 === 0).length;
    if (paresAtual === paresUltimo) {
      for (const d of prox) {
        if (d >= min && d < min + universo) {
          transicao[d - offset]++;
          totalTrans++;
        }
      }
    }
  }
  if (totalTrans === 0) return dezenasValidas.map(() => 1);
  const pesos = dezenasValidas.map((d) => {
    const idx = d - offset;
    const p = (transicao[idx] ?? 0) / totalTrans;
    return Math.max(0.1, p * universo);
  });
  return normalizeWeights(pesos);
}

export function gapsDesvio(dezenas: number[]): number {
  const sorted = [...dezenas].sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++)
    gaps.push((sorted[i] as number) - (sorted[i - 1] as number));
  if (gaps.length < 2) return 0;
  const media = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variancia = gaps.reduce((a, g) => a + (g - media) ** 2, 0) / gaps.length;
  return Math.sqrt(variancia);
}

export function entropiaCombinacao(dezenas: number[], universo: number): number {
  const min = minUniv(universo);
  const numFaixas = Math.max(1, Math.ceil(universo / 10));
  const cont = new Array(numFaixas).fill(0);
  for (const d of dezenas) {
    const faixa = Math.floor((d - min) / 10);
    if (faixa >= 0 && faixa < numFaixas) cont[faixa]++;
  }
  const n = dezenas.length || 1;
  let H = 0;
  for (const c of cont) {
    if (c > 0) {
      const p = c / n;
      H -= p * Math.log2(p);
    }
  }
  return H;
}

export function quantumWalkPesos(ctx: PatternContext): number[] {
  const { historico, universo, dezenasValidas } = ctx;
  const min = minUniv(universo);
  const offset = min;
  const N = universo;

  // Semente: último sorteio (amplitude 1 nos nós sorteados)
  const ultimo = historico.length > 0 ? (historico[historico.length - 1] ?? []) : [];
  // Estado quântico: para cada nó, amplitude (|0> + |1>)/√2 — moeda em superposição
  const psi0 = new Array(N).fill(0);
  const psi1 = new Array(N).fill(0);
  for (const d of ultimo) {
    if (d >= min && d < min + universo) {
      const idx = d - offset;
      psi0[idx] = 1 / Math.sqrt(2);
      psi1[idx] = 1 / Math.sqrt(2);
    }
  }

  // Número de passos (escala com o universo)
  const T = Math.min(8, Math.max(2, Math.floor(universo / 15)));

  let cur0 = [...psi0];
  let cur1 = [...psi1];

  for (let t = 0; t < T; t++) {
    const next0 = new Array(N).fill(0);
    const next1 = new Array(N).fill(0);
    // Hadamard coin + shift (cycle)
    for (let i = 0; i < N; i++) {
      const a0 = cur0[i] ?? 0;
      const a1 = cur1[i] ?? 0;
      // H: |0> -> (|0>+|1>)/√2 ; |1> -> (|0>-|1>)/√2
      const h0 = (a0 + a1) / Math.sqrt(2);
      const h1 = (a0 - a1) / Math.sqrt(2);
      // Shift: moeda |0> move para esquerda, |1> para direita (ciclo)
      const left = (i - 1 + N) % N;
      const right = (i + 1) % N;
      next0[left] = (next0[left] ?? 0) + h0 / Math.sqrt(2);
      next1[right] = (next1[right] ?? 0) + h1 / Math.sqrt(2);
    }
    cur0 = next0;
    cur1 = next1;
  }

  // Probabilidade de medida em cada nó: |ψ0|² + |ψ1|²
  const prob = new Array(N).fill(0);
  let totalProb = 0;
  for (let i = 0; i < N; i++) {
    prob[i] = (cur0[i] ?? 0) ** 2 + (cur1[i] ?? 0) ** 2;
    totalProb += prob[i];
  }

  // Normalização explícita (garantir soma = 1)
  if (totalProb > 0) {
    for (let i = 0; i < N; i++) prob[i] /= totalProb;
  } else {
    // Fallback uniforme se algo der errado
    for (let i = 0; i < N; i++) prob[i] = 1 / N;
  }

  // Debug: log se não unitário (apenas em dev)
  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    Math.abs(totalProb - 1) > 1e-6
  ) {
    console.warn(`[quantumWalk] Norma não unitária: ${totalProb}`);
  }

  // Interferência construtiva com frequência histórica
  const freq = frequenciaLocal(historico, universo);
  const total = freq.reduce((a, b) => a + b, 0) || 1;
  const pesos = dezenasValidas.map((d) => {
    const idx = d - offset;
    const amp = prob[idx] ?? 0;
    const f = (freq[idx] ?? 0) / total;
    // interferência: amplitude quântica modulada por frequência
    return 1 + amp * (0.5 + f);
  });
  return normalizeWeights(pesos);
}

export function interferenciaPesos(freqPesos: number[], atrasoPesos: number[]): number[] {
  const n = freqPesos.length;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const f = freqPesos[i] ?? 1;
    const a = atrasoPesos[i] ?? 1;
    const construtiva = (f + a) / 2;
    const destrutiva = Math.abs(f - a) / 2;
    out[i] = Math.max(0.1, construtiva - 0.3 * destrutiva);
  }
  return normalizeWeights(out);
}

export function geometriaPesos(ctx: PatternContext): number[] {
  const { historico, universo, dezenasValidas } = ctx;
  if (historico.length === 0) return dezenasValidas.map(() => 1);
  const min = minUniv(universo);
  const offset = min;
  const recente = historico.slice(-Math.min(10, historico.length));
  const centroide = new Array(universo).fill(0);
  for (const sorteio of recente) {
    for (const d of sorteio) {
      if (d >= min && d < min + universo) centroide[d - offset] += 1;
    }
  }
  const total = centroide.reduce((a, b) => a + b, 0) || 1;
  for (let i = 0; i < universo; i++) centroide[i] = (centroide[i] ?? 0) / total;
  const pesos = dezenasValidas.map((d) => {
    const idx = d - offset;
    return 1 + (centroide[idx] ?? 0) * universo;
  });
  return normalizeWeights(pesos);
}

/**
 * Pesos baseados na presença/ausência de números de Fibonacci.
 * Ideia: combinações com proporção "natural" de números de Fibonacci
 * tendem a ter espaçamento mais equilibrado (análise de gaps / RMT).
 * NÃO altera probabilidade real — apenas diversifica o formato dos jogos.
 *
 * Se o histórico recente tem MAIS números de Fibonacci que o esperado teórico,
 * damos leve peso extra para números NÃO-Fibonacci (equilibrar), e vice-versa.
 *
 * Intensidade configurável (igual ao beta de E1/E2):
 * - Suave (0.5): bias ±7.5%
 * - Médio (1.0): bias ±15% (default)
 * - Forte (2.0): bias ±30%
 */
export function fibonacciPesos(ctx: PatternContext): number[] {
  const { dezenasValidas, universo, historico, fibonacciIntensidade = 1 } = ctx;
  const fibs = fibonacciFromOne(50).filter((f) => f <= universo);
  const fibSet = new Set(fibs);

  // Proporção teórica de Fibonacci no universo
  const fibRatioTeorico = fibs.length / universo;

  // Proporção observada no histórico recente (últimos 20 concursos)
  const recente = historico.slice(-20);
  let fibFreq = 0;
  let totalDezenas = 0;
  for (const sorteio of recente) {
    for (const d of sorteio) {
      totalDezenas++;
      if (fibSet.has(d)) fibFreq++;
    }
  }

  // Sem histórico suficiente -> pesos neutros
  if (totalDezenas === 0) {
    return dezenasValidas.map(() => 1);
  }

  const fibRatioHistorico = fibFreq / totalDezenas;

  // Bias base ±15% escalado pela intensidade
  const biasBase = 0.15;
  const bias = (fibRatioHistorico > fibRatioTeorico ? -biasBase : biasBase) * fibonacciIntensidade;

  return dezenasValidas.map((d) => {
    const isFib = fibSet.has(d);
    return isFib ? 1 + bias : 1 - bias;
  });
}

/**
 * Combina múltiplos fatores de peso no espaço log (soma de logs = log do produto).
 * Evita overflow/underflow numérico de multiplicações sucessivas.
 * Retorna pesos normalizados para média 1.
 *
 * @param ctx - Contexto com histórico, universo, dezenas válidas, k
 * @param useBMA - Se true, usa Bayesian Model Averaging para aprender pesos dos fatores
 * @returns Pesos combinados normalizados
 */
export function patternWeights(ctx: PatternContext, useBMA = false): number[] {
  const { dezenasValidas, historico } = ctx;
  const n = dezenasValidas.length;

  // Calcular todos os fatores
  const cooc = coocorrenciaPesos(ctx);
  const slide = slidingWindowPesos(ctx);
  const ener = energiaPesos(ctx);
  const mkv = markovPesos(ctx);
  const qw = quantumWalkPesos(ctx);
  const geom = geometriaPesos(ctx);
  const fib = fibonacciPesos(ctx);
  const interf = interferenciaPesos(slide, ener);

  const fatores = [cooc, slide, ener, mkv, qw, geom, fib, interf];
  const numFatores = fatores.length;

  // BMA: aprende pesos dos fatores via cross-validation no histórico
  let pesosFatores: number[] = new Array(numFatores).fill(1 / numFatores);

  if (useBMA && historico && historico.length > 30) {
    pesosFatores = aprenderPesosBMA(ctx, fatores);
  }

  // Espaço log: soma ponderada de logs = log do produto ponderado
  const logWeights = new Array(n).fill(0);
  const EPS = 1e-12;

  for (let j = 0; j < numFatores; j++) {
    const fator = fatores[j];
    const pesoFator = pesosFatores[j];
    for (let i = 0; i < n; i++) {
      const val = Math.max(fator[i] ?? 1, EPS);
      logWeights[i] += pesoFator * Math.log(val);
    }
  }

  // Converter de volta com estabilidade numérica (subtrair max antes de exp)
  const maxLog = Math.max(...logWeights);
  const weights = logWeights.map((lw) => Math.exp(lw - maxLog));

  // Normalizar para média 1
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return dezenasValidas.map(() => 1);
  return weights.map((w) => (w * n) / sum);
}

/**
 * Aprende pesos ótimos para cada fator via Bayesian Model Averaging simplificado.
 * Usa rolling window cross-validation: cada fator é um "expert",
 * e o peso é proporcional à log-likelihood out-of-sample.
 */
function aprenderPesosBMA(ctx: PatternContext, fatores: number[][]): number[] {
  const { historico, dezenasValidas, universo } = ctx;
  const numFatores = fatores.length;
  const totalConcursos = historico.length;

  if (totalConcursos < 30) return new Array(numFatores).fill(1 / numFatores);

  // Usar últimos 20% como teste (mínimo 10, máximo 30)
  const nTeste = Math.min(30, Math.max(10, Math.floor(totalConcursos * 0.2)));
  const inicioTeste = totalConcursos - nTeste;

  // Log-likelihood acumulado para cada fator
  const logLikelihoods = new Array(numFatores).fill(0);
  const nPredicoes = new Array(numFatores).fill(0);

  // Rolling window: para cada concurso de teste, avaliar cada fator
  for (let t = inicioTeste; t < totalConcursos; t++) {
    const concursoAtual = historico[t];
    const historicoTreino = historico.slice(0, t);

    if (historicoTreino.length < 10) continue;

    // Para cada fator, calcular log-likelihood das dezenas do concurso atual
    for (let j = 0; j < numFatores; j++) {
      const fator = fatores[j];

      let ll = 0;
      for (const dezena of concursoAtual) {
        const idx = dezenasValidas.indexOf(dezena);
        if (idx >= 0) {
          const peso = Math.max(fator[idx] ?? 1, 1e-10);
          // Normalizar: peso médio = 1, então prob ~ peso / n
          const prob = Math.max(1e-10, peso / dezenasValidas.length);
          ll += Math.log(prob);
        }
      }

      // Adicionar algumas dezenas não sorteadas (amostragem)
      const todasDezenas = Array.from({ length: universo }, (_, i) =>
        universo === 100 ? i : i + 1,
      );
      const naoSorteadas = todasDezenas.filter((d) => !concursoAtual.includes(d));
      const amostraNegativos = naoSorteadas.slice(0, Math.min(10, naoSorteadas.length));
      for (const dezena of amostraNegativos) {
        const idx = dezenasValidas.indexOf(dezena);
        if (idx >= 0) {
          const peso = Math.max(fator[idx] ?? 1, 1e-10);
          const probNao = Math.max(1e-10, 1 - peso / dezenasValidas.length);
          ll += Math.log(probNao);
        }
      }

      logLikelihoods[j] += ll;
      nPredicoes[j]++;
    }
  }

  // Calcular média de log-likelihood por fator
  const mediaLL = logLikelihoods.map((ll, j) =>
    nPredicoes[j] > 0 ? ll / nPredicoes[j] : Number.NEGATIVE_INFINITY,
  );

  // Softmax para obter pesos (BMA weight ∝ exp(LL))
  const maxLL = Math.max(...mediaLL);
  const expLL = mediaLL.map((ll) => Math.exp(ll - maxLL));
  const sumExp = expLL.reduce((a, b) => a + b, 0);

  if (sumExp === 0) return new Array(numFatores).fill(1 / numFatores);

  return expLL.map((v) => v / sumExp);
}

export function lempelZivComplexity(seq: number[]): number {
  if (seq.length === 0) return 0;
  // binariza por mediana
  const sorted = [...seq].sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const s = seq.map((x) => (x >= med ? '1' : '0')).join('');
  const n = s.length;
  let i = 0;
  let c = 1;
  let k = 1;
  while (true) {
    if (i + k > n) {
      c++;
      break;
    }
    const sub = s.slice(i, i + k);
    const prev = s.slice(0, i + k - 1);
    if (prev.indexOf(sub) !== -1) {
      k++;
      if (k > n - i) {
        c++;
        break;
      }
    } else {
      c++;
      i += k;
      if (i >= n) break;
      k = 1;
    }
    if (i + k > n && k === 1) {
      c++;
      break;
    }
  }
  return c / n;
}

export function patternFilter(
  dezenas: number[],
  universo: number,
  historico?: number[][],
): boolean {
  const sd = gapsDesvio(dezenas);
  const mediaGap =
    dezenas.length > 1 ? (Math.max(...dezenas) - Math.min(...dezenas)) / (dezenas.length - 1) : 1;
  if (sd > mediaGap * 3) return false;
  const H = entropiaCombinacao(dezenas, universo);
  const maxH = Math.log2(Math.max(2, Math.ceil(universo / 10)));
  if (H < maxH * 0.15) return false;
  // Tipicidade via Lempel-Ziv: complexidade do jogo deve estar dentro de 2σ do histórico
  if (historico && historico.length > 5) {
    const comps = historico.map((h) => lempelZivComplexity(h));
    const media = comps.reduce((a, b) => a + b, 0) / comps.length;
    const sdh = Math.sqrt(comps.reduce((a, c) => a + (c - media) ** 2, 0) / comps.length);
    const cj = lempelZivComplexity(dezenas);
    if (Math.abs(cj - media) > 2 * (sdh || 0.05)) return false;
  }
  return true;
}
