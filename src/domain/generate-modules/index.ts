/**
 * Fachada principal de geração de jogos.
 * Orquestra todos os submódulos.
 */

import { getCacheStats } from '../combinatorics';
import { type IRandom, mulberry32, newSeed } from '../rng';
import { modalidadePorId } from '../rules';
import { ultimosN } from '../stats';
import type { Game, GameRequest } from '../types';
import { ALGORITHM_VERSION } from '../version';

import { encontrarJanelaOtima } from './adaptive-window';
import { runCalibration } from './calibration';
import { generateCandidatePool, generateCandidates } from './candidates';
import { diversifyWithSA } from './diversification';
import { createFilterChecker } from './filters';
import { asStringArray, betaFromOpcoes, extractConcursos, opt } from './options';
import { parseRequest } from './parse-request';
import { calculateWeights } from './weights';

export type { Game, GameRequest };
export { parseRequest };

export type ProgressCallback = (progress: {
  phase: 'weights' | 'candidates' | 'diversifying' | 'fallback' | 'complete';
  progress: number; // 0-100
  message: string;
  stats?: { tentativas: number; aceitos: number; jogosGerados: number };
}) => void;

export function generateGames(
  request: GameRequest,
  quantidade?: number,
  rngOrSeed: IRandom | number = mulberry32(newSeed()),
  _fallbackDepth = 0,
  onProgress?: ProgressCallback,
): Game[] & {
  games: Game[];
  meta: {
    algorithmVersion: string;
    seed: number;
    janela: number;
    janelaOtima?: number;
    taxaAceitacao: number;
    estrategiasAtivas: string[];
    tamanhoAposta: number;
    dezenasMarcadas: number;
    universo: number;
    tentativas: number;
    jogosGerados: number;
    cacheHits: number;
    cacheSize: number;
    fallbackDepth: number;
    calibracao?: {
      brierScore: number;
      ece: number;
      interpretacao: string;
      bins: number;
      amostras: number;
    };
  };
} {
  // Previne recursão infinita
  if (_fallbackDepth > 2) {
    throw new Error('Limite de fallbacks excedido.');
  }

  const modalidade = modalidadePorId(request.modalidade);

  const dezenasValidas = request.dezenasMarcadas.filter(
    (d) => d >= (modalidade.id === 'lotomania' ? 0 : 1) && d <= modalidade.universo,
  );

  const tamanho = request.tamanhoAposta ?? modalidade.dezenasSorteadas;
  if (dezenasValidas.length < tamanho) {
    throw new Error('Número insuficiente de dezenas para gerar jogo.');
  }

  const q = quantidade ?? request.quantidade ?? 3;
  if (!Number.isInteger(q) || q < 1 || q > 10) {
    throw new Error('Quantidade inválida (1 a 10).');
  }

  let rng: IRandom;
  let seed: number;
  if (typeof rngOrSeed === 'number') {
    seed = rngOrSeed;
    rng = mulberry32(seed);
  } else {
    rng = rngOrSeed;
    seed = 0;
  }

  const opcoes = request.opcoes as Record<string, unknown> | undefined;

  const estrategiaTokens = asStringArray(
    opt(opcoes, 'estrategia', 'strategy', 'metodo', 'method', 'modo', 'mode', 'E'),
  );
  const flag = (k: string) => {
    const v = opt(opcoes, k);
    return v === true || v === 1 || v === '1' || v === 'true';
  };

  const e0 =
    flag('E0') ||
    flag('e0') ||
    estrategiaTokens.some(
      (t) => t.includes('e0') || t === 'uniforme' || t === 'aleatorio' || t === 'random',
    );
  const e1 =
    flag('E1') ||
    flag('e1') ||
    flag('frequentes') ||
    flag('maisFrequentes') ||
    estrategiaTokens.some((t) => t.includes('e1') || t.includes('frequ'));
  const e2 =
    flag('E2') ||
    flag('e2') ||
    flag('atrasadas') ||
    flag('maisAtrasadas') ||
    estrategiaTokens.some((t) => t.includes('e2') || t.includes('atras'));
  const e3 =
    flag('E3') ||
    flag('e3') ||
    flag('filtros') ||
    flag('filtro') ||
    flag('equilibrio') ||
    estrategiaTokens.some((t) => t.includes('e3') || t.includes('filtro') || t.includes('equil'));
  const e4 =
    flag('E4') ||
    flag('e4') ||
    flag('diversificar') ||
    flag('diversify') ||
    estrategiaTokens.some((t) => t.includes('e4') || t.includes('divers'));

  const temEstrategia = e0 || e1 || e2 || e3 || e4 || estrategiaTokens.length > 0;
  const usarE0 = temEstrategia ? e0 || (!e1 && !e2) : true;
  const usarE1 = e1;
  const usarE2 = e2;
  const usarE3 = e3;
  const usarE4 = e4;

  const beta = betaFromOpcoes(opcoes);
  const evitaCal = flag('evitaCalendario') || flag('evitaPadraoCalendario') || flag('calendario');
  const calibrar = flag('calibrar') || flag('calibration');
  const janelaAdaptativa = flag('janelaAdaptativa') || flag('adaptiveWindow');
  const usarBMA = flag('bma') || flag('bayesianModelAveraging') || flag('useBMA');
  const usarSA = flag('sa') || flag('simulatedAnnealing') || flag('useSA');

  const janelaReq = (() => {
    const v = opt(opcoes, 'janela', 'window', 'N', 'janelaConcursos');
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.floor(v);
    if (typeof v === 'string') {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) return Math.floor(n);
    }
    return 100;
  })();

  const concursos = extractConcursos(opcoes);

  // Janela adaptativa: se solicitado e há histórico suficiente, encontra janela ótima
  let janelaFinal = janelaReq;
  if (janelaAdaptativa && concursos && concursos.length > 50) {
    janelaFinal = encontrarJanelaOtima(concursos, modalidade);
  }

  const windowed = concursos ? ultimosN(concursos, janelaFinal) : [];
  const janelaUsada = windowed.length > 0 ? windowed.length : janelaFinal;

  // Progress: pesos calculados
  onProgress?.({ phase: 'weights', progress: 10, message: 'Calculando pesos das dezenas...' });

  const { weights } = calculateWeights(
    dezenasValidas,
    modalidade,
    windowed,
    opcoes ?? {},
    usarE0,
    usarE1,
    usarE2,
    beta,
    evitaCal,
    usarBMA,
  );

  const filtrosAtivos = usarE3;
  const passaFiltros = createFilterChecker(modalidade, filtrosAtivos, evitaCal, windowed);

  const baseTentativas = Math.max(100, q * 100);
  const maxTentativas = filtrosAtivos || evitaCal ? baseTentativas * 20 : baseTentativas;

  const updateProgress = (phase: 'candidates' | 'diversifying', current: number, total: number) => {
    const progress = Math.min(10 + Math.floor((current / total) * 80), 90);
    onProgress?.({
      phase,
      progress,
      message:
        phase === 'candidates'
          ? `Gerando candidatos... ${current}/${total}`
          : `Diversificando... ${current}/${total}`,
    });
  };

  let games: Game[] = [];
  let tentativas = 0;
  let aceitos = 0;

  if (!usarE4) {
    // Modo simples: gera jogos diretamente
    const result = generateCandidates(
      dezenasValidas,
      weights,
      tamanho,
      q,
      rng,
      passaFiltros,
      maxTentativas,
      updateProgress,
    );
    games = result.candidatos.map((dezenas, idx) => ({
      id: `${modalidade.id}-${idx}-${new Date().toISOString()}`,
      dezenas,
      timestamp: new Date().toISOString(),
      modalidade: request.modalidade,
    }));
    tentativas = result.tentativas;
    aceitos = result.aceitos;

    // Fallback: se filtros muito restritivos impedem geração, relaxa filtros
    if (games.length < q && (filtrosAtivos || evitaCal) && _fallbackDepth < 2) {
      console.warn('[generate] Filtros muito restritivos, tentando sem E3/EvitaCal...');
      const estrategiaOriginal = opcoes?.estrategia;
      const estrategiaFiltrada = Array.isArray(estrategiaOriginal)
        ? estrategiaOriginal.filter((e) => {
            const s = String(e).toLowerCase();
            return !s.includes('e3') && !s.includes('filtro') && !s.includes('equil');
          })
        : estrategiaOriginal;
      return generateGames(
        {
          ...request,
          opcoes: {
            ...(opcoes ?? {}),
            filtros: false,
            evitaCalendario: false,
            diversificar: false,
            estrategia: estrategiaFiltrada,
          },
        },
        quantidade,
        rng,
        _fallbackDepth + 1,
        onProgress,
      );
    }

    // Último recurso: gera sem nenhum filtro (E0) - sempre tenta, sem limite de profundidade
    if (games.length < q) {
      console.warn('[generate] Fallback final: gerando sem filtros (E0)...');
      return generateGames(
        {
          ...request,
          opcoes: {
            ...(opcoes ?? {}),
            estrategia: 'E0',
            filtros: false,
            diversificar: false,
            evitaCalendario: false,
          },
        },
        quantidade,
        rng,
        _fallbackDepth + 1,
        onProgress,
      );
    }
  } else {
    // E4: modo diversificação — precisa de mais tentativas pois filtra candidatos
    const maxTentativasE4 = Math.max(maxTentativas, 10000);
    const result = generateCandidatePool(
      dezenasValidas,
      weights,
      tamanho,
      q,
      rng,
      passaFiltros,
      maxTentativasE4,
      updateProgress,
    );

    const pool = result.candidatos;
    tentativas = result.tentativas;
    aceitos = result.aceitos;

    // Fallback: se não conseguiu gerar candidatos com E4, tenta sem E4
    if (pool.length === 0) {
      if (_fallbackDepth >= 2) {
        throw new Error('Não foi possível gerar jogos mesmo com fallbacks.');
      }
      console.warn('[generate] E4 falhou, tentando sem diversificação...');
      const estrategiaOriginal = opcoes?.estrategia;
      const estrategiaFiltrada = Array.isArray(estrategiaOriginal)
        ? estrategiaOriginal.filter((e) => String(e).toLowerCase() !== 'e4')
        : estrategiaOriginal;
      return generateGames(
        {
          ...request,
          opcoes: {
            ...opcoes,
            diversificar: false,
            filtros: false,
            evitaCalendario: false,
            estrategia: estrategiaFiltrada,
          },
        },
        quantidade,
        rng,
        _fallbackDepth + 1,
        onProgress,
      );
    }

    // Diversificação (SA ou greedy)
    const selecionados = diversifyWithSA(pool, q, rng, usarSA, (_phase, progress, message) => {
      onProgress?.({ phase: 'diversifying', progress, message });
    });

    games = selecionados.map((dezenas, idx) => ({
      id: `${modalidade.id}-${idx}-${new Date().toISOString()}`,
      dezenas,
      timestamp: new Date().toISOString(),
      modalidade: request.modalidade,
    }));
  }

  if (games.length < q) {
    throw new Error('Não foi possível gerar jogos distintos.');
  }

  // Progress final
  onProgress?.({
    phase: 'complete',
    progress: 100,
    message: 'Jogos gerados com sucesso!',
    stats: { tentativas, aceitos, jogosGerados: games.length },
  });

  // Calibração opcional
  let calibrationResult: ReturnType<typeof runCalibration> | undefined;
  if (calibrar && windowed.length > 0 && games.length > 0) {
    onProgress?.({
      phase: 'complete',
      progress: 100,
      message: 'Calculando calibração...',
      stats: { tentativas, aceitos, jogosGerados: games.length },
    });
    calibrationResult = runCalibration(
      windowed,
      modalidade,
      games.map((g) => ({ dezenas: [...g.dezenas] })),
    );
  }

  const cacheStats = getCacheStats();

  const result = games as Game[] & {
    games: Game[];
    meta: {
      algorithmVersion: string;
      seed: number;
      janela: number;
      janelaOtima?: number;
      taxaAceitacao: number;
      estrategiasAtivas: string[];
      tamanhoAposta: number;
      dezenasMarcadas: number;
      universo: number;
      tentativas: number;
      jogosGerados: number;
      cacheHits: number;
      cacheSize: number;
      fallbackDepth: number;
      calibracao?: {
        brierScore: number;
        ece: number;
        interpretacao: string;
        bins: number;
        amostras: number;
      };
    };
  };

  result.games = games;

  const metaBase = {
    algorithmVersion: ALGORITHM_VERSION,
    seed,
    janela: janelaUsada,
    taxaAceitacao: tentativas > 0 ? aceitos / tentativas : 1,
    estrategiasAtivas: [
      usarE0 && 'E0 (uniforme)',
      usarE1 && 'E1 (frequência)',
      usarE2 && 'E2 (atraso)',
      usarE3 && 'E3 (filtros)',
      usarE4 && 'E4 (diversificação)',
    ].filter(Boolean) as string[],
    tamanhoAposta: tamanho,
    dezenasMarcadas: dezenasValidas.length,
    universo: modalidade.universo,
    tentativas,
    jogosGerados: games.length,
    cacheHits: cacheStats.comb + cacheStats.factorial,
    cacheSize: cacheStats.comb + cacheStats.factorial,
    fallbackDepth: _fallbackDepth,
  };

  const metaWithOptional = janelaAdaptativa
    ? { ...metaBase, janelaOtima: janelaFinal as number }
    : metaBase;

  result.meta = calibrationResult
    ? {
        ...metaWithOptional,
        calibracao: {
          brierScore: calibrationResult.brierScore,
          ece: calibrationResult.ece,
          interpretacao: calibrationResult.interpretacao,
          bins: calibrationResult.bins,
          amostras: calibrationResult.resultados.reduce((s, r) => s + r.n, 0),
        },
      }
    : metaWithOptional;

  return result;
}
