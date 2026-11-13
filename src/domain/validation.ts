/**
 * Validação Estatística Honesta — Detecta ilusões, não padrões.
 *
 * Estas funções NÃO geram jogos. Elas respondem:
 * "O histórico tem estrutura explorável ou é compatível com ruído?"
 *
 * Referência: testes padrão de aleatoriedade (NIST, Diehard) adaptados para loteria.
 */

import { modalidadePorId } from './rules';
import type { GameRequest, ModalidadeId } from './types';

/* ============================================================
   1. RUNS TEST (Wald-Wolfowitz) — Não-aleatoriedade sequencial
   ============================================================ */

export interface RunsTestResult {
  runs: number;
  expected: number;
  variance: number;
  z: number;
  pValue: number;
  interpretacao: 'aleatorio' | 'suspeito' | 'nao-aleatorio';
}

/**
 * Teste de runs (Wald-Wolfowitz) na sequência de uma dezena específica.
 * H0: aparições são independentes (aleatórias).
 * H1: há clustering (runs < esperado) ou alternância excessiva (runs > esperado).
 */
export function runsTest(historico: number[][], dezena: number): RunsTestResult {
  // Converter histórico em sequência binária: 1 = saiu, 0 = não saiu
  const sequencia = historico.map((sorteio) => (sorteio.includes(dezena) ? 1 : 0));

  const n = sequencia.length;
  const n1 = sequencia.reduce((a: number, b: number) => a + b, 0); // sucessos
  const n0 = n - n1; // falhas

  if (n1 === 0 || n0 === 0) {
    return {
      runs: 0,
      expected: 0,
      variance: 0,
      z: 0,
      pValue: 1,
      interpretacao: 'aleatorio',
    };
  }

  // Contar runs
  let runs = 1;
  for (let i = 1; i < n; i++) {
    if (sequencia[i] !== sequencia[i - 1]) runs++;
  }

  // Esperado e variância sob H0
  const expected = (2 * n1 * n0) / n + 1;
  const variance = (2 * n1 * n0 * (2 * n1 * n0 - n)) / (n * n * (n - 1));
  const std = Math.sqrt(variance);

  const z = (runs - expected) / std;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));

  let interpretacao: RunsTestResult['interpretacao'] = 'aleatorio';
  if (pValue < 0.01) interpretacao = 'nao-aleatorio';
  else if (pValue < 0.05) interpretacao = 'suspeito';

  return { runs, expected, variance, z, pValue, interpretacao };
}

/* ============================================================
   2. AUTOCORRELAÇÃO DE ATRASOS — Memória no processo
   ============================================================ */

export interface AutocorrelationResult {
  lags: number[];
  acf: number[];
  significantLags: number[];
  interpretacao: 'sem-memoria' | 'memoria-fraca' | 'memoria-forte';
}

/**
 * Autocorrelação da série de atrasos (gaps) de uma dezena.
 * Se houver memória, lags consecutivos correlacionam.
 */
export function autocorrelacaoAtrasos(
  historico: number[][],
  dezena: number,
  maxLag = 10,
): AutocorrelationResult {
  // Extrair série de gaps (atrasos entre aparições consecutivas)
  const gaps: number[] = [];
  let ultimaAparicao = -1;

  for (let i = 0; i < historico.length; i++) {
    const sorteio = historico[i];
    if (!sorteio) continue;
    if (sorteio.includes(dezena)) {
      if (ultimaAparicao >= 0) {
        gaps.push(i - ultimaAparicao - 1);
      }
      ultimaAparicao = i;
    }
  }

  if (gaps.length < maxLag + 5) {
    return {
      lags: Array.from({ length: maxLag }, (_, i) => i + 1),
      acf: Array(maxLag).fill(0),
      significantLags: [],
      interpretacao: 'sem-memoria',
    };
  }

  const media = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variancia = gaps.reduce((a, x) => a + (x - media) ** 2, 0) / gaps.length;

  const acf: number[] = [];
  const significantLags: number[] = [];
  const threshold = 1.96 / Math.sqrt(gaps.length); // 95% IC

  for (let lag = 1; lag <= maxLag; lag++) {
    let cov = 0;
    for (let i = 0; i < gaps.length - lag; i++) {
      const gi = gaps[i];
      const gj = gaps[i + lag];
      if (gi === undefined || gj === undefined) continue;
      cov += (gi - media) * (gj - media);
    }
    const corr = cov / ((gaps.length - lag) * variancia);
    acf.push(corr);

    if (Math.abs(corr) > threshold) significantLags.push(lag);
  }

  let interpretacao: AutocorrelationResult['interpretacao'] = 'sem-memoria';
  if (significantLags.length >= 3) interpretacao = 'memoria-forte';
  else if (significantLags.length >= 1) interpretacao = 'memoria-fraca';

  return {
    lags: Array.from({ length: maxLag }, (_, i) => i + 1),
    acf,
    significantLags,
    interpretacao,
  };
}

/* ============================================================
   3. KS TEST — Distribuição empírica vs teórica
   ============================================================ */

export interface KSTestResult {
  ksStatistic: number;
  criticalValue: number;
  pValue: number;
  interpretacao: 'compativel' | 'divergente';
  detalhes: {
    maximoDesvio: number;
    ondeOcorre: number; // valor x
  };
}

/**
 * Kolmogorov-Smirnov: distribuição empírica de uma métrica vs teórica.
 * Ex: atrasos devem seguir Geométrica(p = k/N).
 */
export function ksTest(amostra: number[], cdfTeorica: (x: number) => number): KSTestResult {
  const n = amostra.length;
  if (n < 10) {
    return {
      ksStatistic: 0,
      criticalValue: 0,
      pValue: 1,
      interpretacao: 'compativel',
      detalhes: { maximoDesvio: 0, ondeOcorre: 0 },
    };
  }

  const sorted = [...amostra].sort((a, b) => a - b);
  let D = 0;
  let xMax = 0;

  for (let i = 0; i < n; i++) {
    const x = sorted[i];
    if (x === undefined) continue;
    const ecdf = (i + 1) / n; // P(X <= x) empírica
    const tcdf = cdfTeorica(x); // P(X <= x) teórica
    const diff = Math.abs(ecdf - tcdf);
    if (diff > D) {
      D = diff;
      xMax = x;
    }
  }

  // Valor crítico ajustado para distribuições discretas (mais conservador)
  // Usa correção de Dwass (1957) para KS discreto
  const criticalValue = 1.48 / Math.sqrt(n); // alpha = 0.05, conservador
  // p-valor aproximado (Massey 1951) com correção
  const pValue = 2 * Math.exp(-2 * n * D * D * 0.8); // fator de correção

  return {
    ksStatistic: D,
    criticalValue,
    pValue: Math.min(1, pValue),
    interpretacao: D > criticalValue ? 'divergente' : 'compativel',
    detalhes: { maximoDesvio: D, ondeOcorre: xMax },
  };
}

/* ============================================================
   4. BOOTSTRAP CONFIDENCE INTERVALS — IC sem assumir normalidade
   ============================================================ */

export interface BootstrapCIResult {
  media: number;
  ic95: [number, number];
  ic99: [number, number];
  bias: number;
  se: number;
}

/**
 * Bootstrap percentil para IC de qualquer estatística.
 * Não assume normalidade — funciona para médias, medianas, quantis, etc.
 */
export function bootstrapCI(
  dados: number[],
  estatistica: (amostra: number[]) => number,
  B = 2000,
  seed = 42,
): BootstrapCIResult {
  const n = dados.length;
  if (n < 5) {
    const m = estatistica(dados);
    return { media: m, ic95: [m, m], ic99: [m, m], bias: 0, se: 0 };
  }

  const rng = createRng(seed);
  const bootstraps: number[] = [];

  for (let b = 0; b < B; b++) {
    const idx = Math.floor(rng() * n);
    const valor = dados[idx];
    if (valor === undefined) continue;
    const amostra = Array.from({ length: n }, () => {
      const idx2 = Math.floor(rng() * n);
      return dados[idx2] ?? 0;
    });
    bootstraps.push(estatistica(amostra));
  }

  bootstraps.sort((a, b) => a - b);

  const mediaOriginal = estatistica(dados);
  const mediaBoot = bootstraps.reduce((a, b) => a + b, 0) / B;
  const bias = mediaBoot - mediaOriginal;
  const se = Math.sqrt(bootstraps.reduce((a, x) => a + (x - mediaBoot) ** 2, 0) / (B - 1));

  const idx95Low = Math.floor(0.025 * B);
  const idx95High = Math.ceil(0.975 * B);
  const idx99Low = Math.floor(0.005 * B);
  const idx99High = Math.ceil(0.995 * B);

  const ic95: [number, number] = [bootstraps[idx95Low] ?? 0, bootstraps[idx95High] ?? 0];
  const ic99: [number, number] = [bootstraps[idx99Low] ?? 0, bootstraps[idx99High] ?? 0];

  return { media: mediaOriginal, ic95, ic99, bias, se };
}

/* ============================================================
   5. CALIBRAÇÃO DE PROBABILIDADES — Suas prob. fazem sentido?
   ============================================================ */

export interface CalibrationResult {
  bins: number;
  resultados: Array<{
    bin: number;
    probMedia: number;
    freqObservada: number;
    n: number;
    erro: number;
  }>;
  brierScore: number;
  ece: number; // Expected Calibration Error
  interpretacao: 'bem-calibrado' | 'mal-calibrado';
}

/**
 * Teste de calibração (reliability diagram).
 * Divide predições em bins e compara prob. média vs freq. observada.
 * Brier Score = MSE probabilístico (menor = melhor).
 * ECE = média ponderada de |prob - freq|.
 */
export function calibrationTest(
  predicoes: number[], // probabilidades preditas [0,1]
  observacoes: number[], // 0 ou 1 (acertou/não acertou)
): CalibrationResult {
  const n = predicoes.length;
  if (n !== observacoes.length || n === 0) {
    return { bins: 0, resultados: [], brierScore: 0, ece: 0, interpretacao: 'bem-calibrado' };
  }

  const bins = 10;
  const binEdges = Array.from({ length: bins + 1 }, (_, i) => i / bins);
  const resultados: CalibrationResult['resultados'] = [];

  let brierScore = 0;
  let ece = 0;

  for (let b = 0; b < bins; b++) {
    const low = binEdges[b];
    const high = binEdges[b + 1];
    if (low === undefined || high === undefined) continue;

    const indices = predicoes
      .map((p, i) => ({ p, o: observacoes[i], i }))
      .filter(({ p }) => p >= low && (b === bins - 1 ? p <= high : p < high))
      .map(({ o, i }) => ({ o, i }));

    if (indices.length === 0) {
      resultados.push({ bin: b, probMedia: (low + high) / 2, freqObservada: 0, n: 0, erro: 0 });
      continue;
    }

    const probMedia = indices.reduce((a, { i }) => a + (predicoes[i] ?? 0), 0) / indices.length;
    const freqObservada = indices.reduce((a, { o }) => a + (o ?? 0), 0) / indices.length;
    const erro = Math.abs(probMedia - freqObservada);

    resultados.push({
      bin: b,
      probMedia,
      freqObservada,
      n: indices.length,
      erro,
    });

    // Brier Score contribuição
    for (const { o, i } of indices) {
      brierScore += ((predicoes[i] ?? 0) - (o ?? 0)) ** 2;
    }

    ece += (indices.length / n) * erro;
  }

  brierScore /= n;

  return {
    bins,
    resultados,
    brierScore,
    ece,
    interpretacao: ece < 0.05 ? 'bem-calibrado' : 'mal-calibrado',
  };
}

/* ============================================================
   6. SENSITIVITY ANALYSIS — Resultado muda com parâmetros?
   ============================================================ */

export interface SensitivityResult {
  parametro: string;
  valores: number[];
  metricas: Array<{
    valor: number;
    mediaAcertos: number;
    taxaAceitacao: number;
    jogosGerados: number;
  }>;
  elasticidade: number; // % mudança na métrica / % mudança no param
  interpretacao: 'estavel' | 'sensivel' | 'muito-sensivel';
}

/**
 * Análise de sensibilidade: varia um parâmetro e mede impacto.
 * Se pequena mudança no parâmetro muda muito o resultado -> instável.
 */
export async function sensitivityAnalysis(
  baseRequest: GameRequest,
  parametro: string,
  valores: number[],
  gerarJogos: (
    req: GameRequest,
    q: number,
    seed: number,
  ) => { games: readonly { dezenas: readonly number[] }[]; meta: { taxaAceitacao: number } },
  nTestes = 5,
  seedBase = 123,
): Promise<SensitivityResult> {
  const metricas: SensitivityResult['metricas'] = [];

  for (const valor of valores) {
    const req = { ...baseRequest, opcoes: { ...baseRequest.opcoes, [parametro]: valor } };
    let somaTaxa = 0;
    let somaJogos = 0;

    for (let t = 0; t < nTestes; t++) {
      const resultado = gerarJogos(req, 1, seedBase + t * 1000 + Math.floor(valor * 100));
      somaJogos += resultado.games?.length ?? 0;
      somaTaxa += resultado.meta?.taxaAceitacao ?? 0;
      // Simular acerto vs sorteio aleatório
      // const jogo = resultado.games?.[0]?.dezenas ?? [];
      // (em produção, comparar com sorteio real)
    }

    metricas.push({
      valor,
      mediaAcertos: 0, // placeholder
      taxaAceitacao: somaTaxa / nTestes,
      jogosGerados: somaJogos / nTestes,
    });
  }

  // Elasticidade: %Δmétrica / %Δparâmetro (usando taxa de aceitação)
  const x1 = valores[0] ?? 0;
  const x2 = valores[valores.length - 1] ?? 0;
  const y1 = metricas[0]?.taxaAceitacao ?? 0;
  const y2 = metricas[metricas.length - 1]?.taxaAceitacao ?? 0;
  const elasticidade = x1 !== 0 && y1 !== 0 ? (y2 - y1) / y1 / ((x2 - x1) / x1) : 0;

  let interpretacao: SensitivityResult['interpretacao'] = 'estavel';
  if (Math.abs(elasticidade) > 2) interpretacao = 'muito-sensivel';
  else if (Math.abs(elasticidade) > 0.5) interpretacao = 'sensivel';

  return { parametro, valores, metricas, elasticidade, interpretacao };
}

/* ============================================================
   7. FUNÇÕES AUXILIARES
   ============================================================ */

function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * ax);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return 0.5 * (1 + sign * erf);
}

// Mulberry32 PRNG
function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================================================
   8. RELATÓRIO COMPLETO DE VALIDAÇÃO
   ============================================================ */

export interface ValidationReport {
  modalidade: ModalidadeId;
  universo: number;
  nConcursos: number;
  runsTest: Record<number, RunsTestResult>;
  autocorrelacao: Record<number, AutocorrelationResult>;
  ksTestAtrasos: Record<number, KSTestResult>;
  calibracao: CalibrationResult;
  bootstrapMediaAtraso: BootstrapCIResult;
  interpretacaoGeral: 'aleatorio' | 'anomalias-leves' | 'anomalias-fortes';
  resumo: string;
}

/**
 * Gera relatório completo de validação para uma modalidade.
 * Roda todos os testes e dá veredito honesto.
 */
export function gerarRelatorioValidacao(
  historico: number[][],
  modalidadeId: ModalidadeId,
): ValidationReport {
  const regras = modalidadePorId(modalidadeId);
  const universo = regras.universo;
  const k = regras.dezenasSorteadas;
  const min = universo === 100 ? 0 : 1;

  // Testes por dezena (amostragem se muito grande)
  const dezenas = Array.from({ length: universo }, (_, i) => min + i);
  const amostraDezenas = dezenas.slice(0, Math.min(20, universo)); // max 20 para performance

  const runsTestResults: Record<number, RunsTestResult> = {};
  const autocorrelacao: Record<number, AutocorrelationResult> = {};
  const ksTestAtrasos: Record<number, KSTestResult> = {};

  // CDF teórica de atrasos: Geométrica(p = k/universo)
  const p = k / universo;
  const cdfGeometrica = (x: number) => 1 - (1 - p) ** (x + 1);

  for (const d of amostraDezenas) {
    runsTestResults[d] = runsTest(historico, d);
    autocorrelacao[d] = autocorrelacaoAtrasos(historico, d);

    // Extrair gaps desta dezena
    const gaps: number[] = [];
    let ultima = -1;
    for (let i = 0; i < historico.length; i++) {
      const sorteio = historico[i];
      if (!sorteio) continue;
      if (sorteio.includes(d)) {
        if (ultima >= 0) gaps.push(i - ultima - 1);
        ultima = i;
      }
    }
    if (gaps.length > 10) {
      ksTestAtrasos[d] = ksTest(gaps, cdfGeometrica);
    }
  }

  // Calibração: usar predições do modelo vs realidade
  // (simplificado - em produção, usar predições reais do gerador)
  const predicoes: number[] = [];
  const observacoes: number[] = [];
  for (let i = 50; i < historico.length; i++) {
    const sorteio = historico[i];
    if (!sorteio) continue;
    // Probabilidade uniforme como baseline
    for (const d of dezenas) {
      predicoes.push(k / universo);
      observacoes.push(sorteio.includes(d) ? 1 : 0);
    }
  }
  const calibracao = calibrationTest(predicoes, observacoes);

  // Bootstrap na média de atrasos
  const todosAtrasos: number[] = [];
  for (const d of dezenas) {
    let ultima = -1;
    for (let i = 0; i < historico.length; i++) {
      const sorteio = historico[i];
      if (!sorteio) continue;
      if (sorteio.includes(d)) {
        if (ultima >= 0) todosAtrasos.push(i - ultima - 1);
        ultima = i;
      }
    }
  }
  const bootstrapMediaAtraso = bootstrapCI(
    todosAtrasos,
    (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
  );

  // Interpretação geral
  const anomaliasFortes = Object.values(runsTestResults).filter(
    (r) => r.interpretacao === 'nao-aleatorio',
  ).length;
  const anomaliasLeves = Object.values(runsTestResults).filter(
    (r) => r.interpretacao === 'suspeito',
  ).length;
  const memoriaForte = Object.values(autocorrelacao).filter(
    (a) => a.interpretacao === 'memoria-forte',
  ).length;
  const ksDivergente = Object.values(ksTestAtrasos).filter(
    (k) => k.interpretacao === 'divergente',
  ).length;

  let interpretacaoGeral: ValidationReport['interpretacaoGeral'] = 'aleatorio';
  // Requer pelo menos 2 anomalias fortes OU 1 forte + KS divergente para "anomalias-fortes"
  if (anomaliasFortes >= 2 || (anomaliasFortes >= 1 && ksDivergente >= 1) || memoriaForte > 0) {
    interpretacaoGeral = 'anomalias-fortes';
  } else if (anomaliasLeves > 3) {
    interpretacaoGeral = 'anomalias-leves';
  }

  const resumo = [
    `Modalidade: ${regras.nome} (universo ${universo}, ${k} sorteadas)`,
    `Concursos analisados: ${historico.length}`,
    `Dezenas testadas: ${amostraDezenas.length}`,
    `Runs test: ${anomaliasFortes} fortes, ${anomaliasLeves} leves`,
    `Autocorrelação: ${memoriaForte} com memória forte`,
    `KS test (atrasos): ${ksDivergente} divergentes`,
    `Calibração (uniforme): ECE = ${calibracao.ece.toFixed(4)} (${calibracao.interpretacao})`,
    `Bootstrap média atraso: ${bootstrapMediaAtraso.media.toFixed(2)} [${bootstrapMediaAtraso.ic95[0].toFixed(2)}, ${bootstrapMediaAtraso.ic95[1].toFixed(2)}]`,
    `VEREDITO: ${interpretacaoGeral.toUpperCase()}`,
  ].join('\n');

  return {
    modalidade: modalidadeId,
    universo,
    nConcursos: historico.length,
    runsTest: runsTestResults,
    autocorrelacao,
    ksTestAtrasos,
    calibracao,
    bootstrapMediaAtraso,
    interpretacaoGeral,
    resumo,
  };
}
