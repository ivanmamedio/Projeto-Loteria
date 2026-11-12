/**
 * Backtest walk-forward para validação científica do gerador.
 *
 * Para cada concurso t (a partir de um deslocamento), usa histórico até t-1,
 * gera um jogo com o pipeline atual (generateGames) e compara com o sorteio
 * real de t. Não altera a geração — apenas mede honestamente se alguma
 * estratégia bate o baseline uniforme (em loteria i.i.d. honesta, não deve).
 */
import { generateGames, parseRequest } from './generate';
import { mulberry32 } from './rng';
import { modalidadePorId } from './rules';
import { distribuicaoAcertos } from './stats';
import type { ModalidadeId } from './types';

export interface BacktestResult {
  modalidade: ModalidadeId;
  universo: number;
  k: number;
  nTestes: number;
  acertosObservados: Record<number, number>;
  acertosEsperados: Record<number, number>;
  quiQuadrado: { chi2: number; graus: number; pValor: number };
  mediaAcertosObservada: number;
  mediaAcertosEsperada: number;
  estrategiaUsada: string;
  janela: number;
  taxaAceitacaoMedia: number;
}

export function backtestWalkForward(
  historico: number[][],
  modalidadeId: ModalidadeId,
  janela = 100,
  nTestes = 50,
  estrategia: string[] = ['E1', 'E3', 'E4'],
  seed = 42,
): BacktestResult {
  const modalidade = modalidadePorId(modalidadeId);
  const universo = modalidade.universo;
  const k = modalidade.dezenasSorteadas;
  const N = historico.length;

  if (N < janela + 2) {
    throw new Error(`Histórico insuficiente: ${N} concursos, necessário ${janela + 2}.`);
  }

  const acertosObs: Record<number, number> = {};
  for (let j = 0; j <= k; j++) acertosObs[j] = 0;

  let taxaAceitacaoSoma = 0;
  let taxaAceitacaoCont = 0;
  let mediaAcertosObs = 0;

  const inicio = Math.max(janela, N - nTestes);

  for (let t = inicio; t < N; t++) {
    const histAte = historico.slice(Math.max(0, t - janela), t);
    const alvo = historico[t] ?? [];
    const alvoSet = new Set(alvo);

    const minU = modalidade.id === 'lotomania' ? 0 : 1;
    const dezenasValidas: number[] = [];
    for (let d = minU; d < minU + universo; d++) dezenasValidas.push(d);

    const semente = seed + (t - inicio);
    const request = parseRequest({
      modalidade: modalidadeId,
      dezenasMarcadas: dezenasValidas,
      tamanhoAposta: k,
      opcoes: {
        estrategia,
        janela,
        concursos: histAte,
        filtros: true,
        diversificar: true,
        evitaCalendario: false,
      },
    });

    try {
      const resultado = generateGames(request, 1, mulberry32(semente)) as unknown as {
        games: { dezenas: number[] }[];
        meta: { taxaAceitacao: number };
      };
      const jogo = resultado.games[0]?.dezenas ?? [];
      let acertos = 0;
      for (const d of jogo) if (alvoSet.has(d)) acertos++;
      acertosObs[acertos] = (acertosObs[acertos] ?? 0) + 1;
      mediaAcertosObs += acertos;
      taxaAceitacaoSoma += resultado.meta?.taxaAceitacao ?? 1;
      taxaAceitacaoCont++;
    } catch {
      acertosObs[0] = (acertosObs[0] ?? 0) + 1;
      mediaAcertosObs += 0;
      taxaAceitacaoCont++;
    }
  }

  // Distribuição teórica de acertos (hipergeométrica)
  const distTeorica = distribuicaoAcertos(universo, k, k);
  const acertosEsp: Record<number, number> = {};
  for (const { acertos, probabilidade } of distTeorica) {
    acertosEsp[acertos] = Math.round(probabilidade * nTestes * 100) / 100;
  }

  // Qui-quadrado de aderência (observado vs esperado)
  let chi2 = 0;
  let graus = 0;
  for (let j = 0; j <= k; j++) {
    const obs = acertosObs[j] ?? 0;
    const esp = Math.max(acertosEsp[j] ?? 0, 0.5);
    chi2 += (obs - esp) ** 2 / esp;
    graus++;
  }
  graus = Math.max(1, graus - 1);

  const pValor = pValorQuiQuadrado(chi2, graus);

  return {
    modalidade: modalidadeId,
    universo,
    k,
    nTestes,
    acertosObservados: acertosObs,
    acertosEsperados: acertosEsp,
    quiQuadrado: { chi2, graus, pValor },
    mediaAcertosObservada: mediaAcertosObs / nTestes,
    mediaAcertosEsperada: (k * k) / universo,
    estrategiaUsada: estrategia.join(','),
    janela,
    taxaAceitacaoMedia: taxaAceitacaoCont > 0 ? taxaAceitacaoSoma / taxaAceitacaoCont : 0,
  };
}

/**
 * p-valor aproximado para qui-quadrado (Wilson-Hilferty).
 */
function pValorQuiQuadrado(chi2: number, graus: number): number {
  if (chi2 <= 0) return 1;
  if (graus <= 0) return 0;
  const h =
    1 -
    2 / (9 * graus) +
    Math.sqrt(2 / (9 * graus)) * Math.pow(chi2 / graus, 1 / 3) -
    Math.sqrt(2 / (9 * graus));
  const phi = (z: number) => 0.5 * (1 + mathErf(z / Math.sqrt(2)));
  return 1 - phi(h);
}

/**
 * Função de erro (erf) por série de Taylor.
 */
function mathErf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  let sum = 0;
  let term = x;
  for (let n = 0; n < 20; n++) {
    sum += term;
    term *= (-(x * x) * (2 * n + 1)) / ((n + 1) * (2 * n + 3));
  }
  return sign * (2 / Math.sqrt(Math.PI)) * sum;
}
