/**
 * Fachada de geração de jogos.
 */

import { evitaPadraoCalendario, filtrosEquilibrio, verificaFiltros } from './filters';
import { type IRandom, mulberry32, newSeed } from './rng';
import { modalidadePorId } from './rules';
import { sampleWeighted } from './sampling';
import { atrasoAcumulado, frequenciaDezenas, ultimosN } from './stats';
import type { Game, GameRequest } from './types';
import type { ModalidadeId } from './types';
import { ALGORITHM_VERSION } from './version';
import { patternWeights, patternFilter } from './patterns';
import { atrasoWeights, frequencyWeights } from './weights';
import { getCacheStats, clearCombinatoricsCache } from './combinatorics';

export type { Game, GameRequest };

export function parseRequest(input: unknown): GameRequest {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Request inválida: deve ser um objeto.');
  }

  const obj = input as Record<string, unknown>;

  if (typeof obj.modalidade !== 'string') {
    throw new Error('Falta o campo `modalidade`.');
  }
  const modalidadeId = obj.modalidade as ModalidadeId;
  const modalidade = modalidadePorId(modalidadeId);

  if (!Array.isArray(obj.dezenasMarcadas)) {
    throw new Error('Falta o campo `dezenasMarcadas`.');
  }

  const dezenasRaw = obj.dezenasMarcadas as unknown[];
  const dezenas = dezenasRaw
    .map((x) => {
      if (typeof x !== 'number' && typeof x !== 'string') {
        throw new Error('Cada dezena deve ser número ou string.');
      }
      const n = Number(x);
      if (
        !Number.isInteger(n) ||
        n < (modalidade.id === 'lotomania' ? 0 : 1) ||
        n > modalidade.universo
      ) {
        throw new Error(`Dezena ${n} inválida para ${modalidade.nome}.`);
      }
      return n;
    })
    .filter((v, i, arr) => arr.indexOf(v) === i);

  if (dezenas.length === 0) {
    throw new Error('Nenhuma dezena válida fornecida.');
  }

  if (dezenas.length < modalidade.minDezenas) {
    throw new Error(`Pelo menos ${modalidade.minDezenas} dezenas são necessárias.`);
  }

  // Validações opcionais
  let quantidade: number | undefined;
  if (obj.quantidade !== undefined) {
    const q = obj.quantidade;
    if (typeof q !== 'number' || !Number.isInteger(q) || q < 1 || q > 10) {
      throw new Error('Quantidade inválida (1 a 10).');
    }
    quantidade = q;
  }
  let tamanhoAposta: number | undefined;
  if (obj.tamanhoAposta !== undefined) {
    const t = obj.tamanhoAposta;
    if (
      typeof t !== 'number' ||
      !Number.isInteger(t) ||
      t < modalidade.minDezenas ||
      t > modalidade.maxDezenas
    ) {
      throw new Error('Tamanho de aposta inválido.');
    }
    tamanhoAposta = t;
  }
  let opcoes: Record<string, unknown> | undefined;
  if (obj.opcoes !== undefined) {
    if (typeof obj.opcoes !== 'object' || obj.opcoes === null) {
      throw new Error('Opções inválidas.');
    }
    opcoes = obj.opcoes as Record<string, unknown>;
  }

  return {
    modalidade: modalidadeId,
    dezenasMarcadas: dezenas,
    ...(quantidade !== undefined ? { quantidade } : {}),
    ...(tamanhoAposta !== undefined ? { tamanhoAposta } : {}),
    ...(opcoes !== undefined ? { opcoes } : {}),
  } as GameRequest;
}

function opt(opcoes: Record<string, unknown> | undefined, ...keys: string[]): unknown {
  if (!opcoes) return undefined;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(opcoes, k)) return opcoes[k];
  }
  return undefined;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).toLowerCase());
  if (typeof v === 'string') return [v.toLowerCase()];
  if (typeof v === 'number') return [`e${v}`];
  return [];
}

function extractConcursos(opcoes: Record<string, unknown> | undefined): number[][] | undefined {
  const raw = opt(opcoes, 'concursos', 'historico', 'dados', 'data', 'registros', 'draws', 'jogos');
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    if (Array.isArray(raw[0])) return raw as number[][];
    if (typeof raw[0] === 'object' && raw[0] !== null && 'dezenas' in (raw[0] as object)) {
      return (raw as { dezenas: number[] }[]).map((x) => x.dezenas);
    }
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.concursos)) {
      return (obj.concursos as { dezenas?: number[] }[]).map((x) => x.dezenas ?? []);
    }
    if (Array.isArray(obj.draws)) {
      return (obj.draws as { dezenas?: number[] }[]).map((x) => x.dezenas ?? []);
    }
    if (Array.isArray(obj.registros)) {
      return (obj.registros as { dezenas?: number[] }[]).map((x) => x.dezenas ?? []);
    }
  }
  return undefined;
}

function betaFromOpcoes(opcoes: Record<string, unknown> | undefined): number {
  const intensidade = opt(opcoes, 'intensidade', 'intensity');
  const mapa: Record<string, number> = {
    suave: 0.5,
    medio: 1,
    médio: 1,
    medium: 1,
    forte: 2,
    strong: 2,
  };
  if (typeof intensidade === 'string' && mapa[intensidade.toLowerCase()] !== undefined) {
    return mapa[intensidade.toLowerCase()] as number;
  }
  const beta = opt(opcoes, 'beta', 'potencia', 'power');
  if (typeof beta === 'number' && Number.isFinite(beta)) return beta;
  if (typeof beta === 'string') {
    const n = Number(beta);
    if (Number.isFinite(n)) return n;
  }
  return 1;
}
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
  onProgress?: ProgressCallback
): Game[] & {
  games: Game[];
  meta: { algorithmVersion: string; seed: number; janela: number; taxaAceitacao: number };
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
  const windowed = concursos ? ultimosN(concursos, janelaReq) : [];
  const janelaUsada = windowed.length > 0 ? windowed.length : janelaReq;
  const freqRec = windowed.length > 0 ? frequenciaDezenas(windowed) : {};
  const atrasoDe = (d: number) => (windowed.length > 0 ? atrasoAcumulado(windowed, d) : 0);

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

  let freqArr = dezenasValidas.map((d) => freqRec[d] ?? 0);
  let atrasoArr = dezenasValidas.map((d) => atrasoDe(d));
  const freqOverride = opt(opcoes, 'frequencias', 'frequencies', 'freq', 'f');
  const atrasoOverride = opt(opcoes, 'atrasos', 'delays', 'atraso', 'a');
  if (freqOverride !== undefined) freqArr = toNumberArray(freqOverride, true);
  if (atrasoOverride !== undefined) atrasoArr = toNumberArray(atrasoOverride, true);
  let weights = dezenasValidas.map(() => 1);
  const pesosOverride = opt(opcoes, 'pesos', 'weights', 'w');
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

  // Análise de padrões (teorias_analise_padroes.md) aplicada no back:
  // influencia os pesos de forma transparente quando há histórico disponível.
  if (windowed.length > 0) {
    const pw = patternWeights({
      historico: windowed,
      universo: modalidade.universo,
      dezenasValidas,
      k: tamanho,
    });
    weights = weights.map((x, i) => x * (pw[i] ?? 1));
  }
  
  // Progress: pesos calculados
  onProgress?.({ phase: 'weights', progress: 10, message: 'Calculando pesos das dezenas...' });

  const filtrosAtivos = usarE3;
  const passaFiltros = (dezenas: number[]): boolean => {
    if (!filtrosAtivos) return true;
    const filtros = filtrosEquilibrio(modalidade.universo, dezenas.length);
    const res = verificaFiltros(dezenas, modalidade.universo, filtros);
    if (!res.passa) return false;
    const numFaixas = Math.max(1, Math.ceil(modalidade.universo / 10));
    const maxPorFaixa = Math.ceil(dezenas.length / numFaixas) + 1;
    const contagemFaixa = new Map<number, number>();
    const minUniv = modalidade.id === 'lotomania' ? 0 : 1;
    for (const d of dezenas) {
      const faixa = Math.floor((d - minUniv) / 10);
      contagemFaixa.set(faixa, (contagemFaixa.get(faixa) ?? 0) + 1);
    }
    for (const c of contagemFaixa.values()) {
      if (c > maxPorFaixa) return false;
    }
    if (evitaCal && !evitaPadraoCalendario(dezenas)) return false;
    // Filtros de padrões (gaps/entropia) aplicados no back quando filtros ativos
    if (filtrosAtivos && !patternFilter(dezenas, modalidade.universo, windowed)) return false;
    return true;
  };

  const rngFn = () => rng.next();
  // Aumenta tentativas quando filtros estão ativos (taxa de aceitação baixa)
  const baseTentativas = Math.max(100, q * 100);
  const maxTentativas = filtrosAtivos || evitaCal ? baseTentativas * 20 : baseTentativas;

  const games: Game[] = [];
  const usados = new Set<string>();
  let tentativas = 0;
  let aceitos = 0;
  let lastProgressUpdate = 0;
  
  const updateProgress = (phase: 'candidates' | 'diversifying', current: number, total: number) => {
    const progress = Math.min(10 + Math.floor((current / total) * 80), 90);
    if (progress - lastProgressUpdate >= 5 || current === total) { // Throttle updates
      lastProgressUpdate = progress;
      onProgress?.({
        phase,
        progress,
        message: phase === 'candidates' 
          ? `Gerando candidatos... ${current}/${total} (${aceitos} aceitos)`
          : `Diversificando... ${current}/${total}`,
        stats: { tentativas, aceitos, jogosGerados: games.length }
      });
    }
  };
  
  const gerarCandidato = (): number[] | null => {
    const cand = sampleWeighted(dezenasValidas, weights, tamanho, rngFn);
    tentativas++;
    if (!passaFiltros(cand)) return null;
    const chave = cand.join(',');
    if (usados.has(chave)) return null;
    return cand;
  };

  if (!usarE4) {
    while (games.length < q && tentativas < maxTentativas) {
      const cand = gerarCandidato();
      if (!cand) {
        updateProgress('candidates', Math.min(tentativas, maxTentativas), maxTentativas);
        continue;
      }
      usados.add(cand.join(','));
      aceitos++;
      const timestamp = new Date().toISOString();
      games.push({
        id: `${modalidade.id}-${games.length}-${timestamp}`,
        dezenas: cand,
        timestamp,
        modalidade: request.modalidade,
      });
      updateProgress('candidates', games.length, q);
    }
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
            ...opcoes,
            filtros: false,
            evitaCalendario: false,
            diversificar: false,
            estrategia: estrategiaFiltrada,
          },
        },
        quantidade,
        rng,
        _fallbackDepth + 1,
        onProgress
      );
    }
    // Último recurso: gera sem nenhum filtro (E0) - sempre tenta, sem limite de profundidade
    if (games.length < q) {
      console.warn('[generate] Fallback final: gerando sem filtros (E0)...');
      return generateGames(
        {
          ...request,
          opcoes: {
            ...opcoes,
            estrategia: 'E0',
            filtros: false,
            diversificar: false,
            evitaCalendario: false,
          },
        },
        quantidade,
        rng,
        _fallbackDepth + 1,
        onProgress
      );
    }
  } else {
    // E4: modo diversificação — precisa de mais tentativas pois filtra candidatos
    const maxTentativasE4 = Math.max(maxTentativas, 10000);
    const totalCandidatos = Math.max(50, 30 * q);
    const candidatos: number[][] = [];
    const vistos = new Set<string>();
    while (candidatos.length < totalCandidatos && tentativas < maxTentativasE4) {
      const cand = sampleWeighted(dezenasValidas, weights, tamanho, rngFn);
      tentativas++;
      if (!passaFiltros(cand)) {
        updateProgress('candidates', Math.min(tentativas, maxTentativasE4), maxTentativasE4);
        continue;
      }
      const chave = cand.join(',');
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      candidatos.push(cand);
      aceitos++;
      updateProgress('candidates', candidatos.length, totalCandidatos);
    }
    // Fallback: se não conseguiu gerar candidatos com E4, tenta sem E4 (apenas E1+E3)
    if (candidatos.length === 0) {
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
        onProgress
      );
    }
    const selecionados: number[][] = [candidatos[0] as number[]];
    const restantes = candidatos.slice(1);
    const overlap = (a: number[], b: number[]) => {
      const set = new Set(a);
      return b.filter((x) => set.has(x)).length;
    };
    // Progress para diversificação
    updateProgress('diversifying', 1, q);
    while (selecionados.length < q && restantes.length > 0) {
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
      updateProgress('diversifying', selecionados.length, q);
    }
    // Fallback final: se não conseguiu diversificar o suficiente, usa os primeiros
    if (selecionados.length < q && _fallbackDepth < 2) {
      console.warn('[generate] E4: não diversificou o suficiente, completando com primeiros...');
      while (selecionados.length < q && restantes.length > 0) {
        selecionados.push(restantes.shift() as number[]);
      }
    }
    for (const dezenas of selecionados) {
      const chave = dezenas.join(',');
      if (usados.has(chave)) continue;
      usados.add(chave);
      const timestamp = new Date().toISOString();
      games.push({
        id: `${modalidade.id}-${games.length}-${timestamp}`,
        dezenas,
        timestamp,
        modalidade: request.modalidade,
      });
    }
  }

  if (games.length < q) {
    throw new Error('Não foi possível gerar jogos distintos.');
  }

  // Progress final
  onProgress?.({ phase: 'complete', progress: 100, message: 'Jogos gerados com sucesso!', stats: { tentativas, aceitos, jogosGerados: games.length } });

  const cacheStats = getCacheStats();

  const result = games as Game[] & {
    games: Game[];
    meta: {
      algorithmVersion: string;
      seed: number;
      janela: number;
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
    };
  };
  result.games = games;
  result.meta = {
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
  return result;
}
