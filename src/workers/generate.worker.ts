// Web Worker para geração de jogos (não bloqueia UI principal)
// Compilado como módulo separado para Astro

import { generateGames } from '../domain/generate';
import { mulberry32, newSeed } from '../domain/rng';
import { type ModalidadeId, dezenasDoUniverso, modalidadePorId } from '../domain/rules';
import { sampleNoReplace } from '../domain/sampling';

type WorkerMessage = { type: 'generate'; payload: GeneratePayload } | { type: 'cancel' };

type GeneratePayload = {
  modalidade: ModalidadeId;
  dezenasMarcadas: number[];
  opcoes: Record<string, unknown>;
  quantidade: number;
  concursos?: number[][];
  seed: number;
};

type WorkerResponse =
  | { type: 'progress'; progress: ProgressData }
  | { type: 'result'; games: GameResult[]; meta: GameMeta }
  | { type: 'error'; message: string };

type ProgressData = {
  phase: 'weights' | 'candidates' | 'diversifying' | 'fallback' | 'complete';
  progress: number;
  message: string;
  stats?: { tentativas: number; aceitos: number; jogosGerados: number };
};

type GameResult = {
  dezenas: number[];
  meta: { janela: number; taxaAceitacao: number };
};

type GameMeta = {
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
  calibracao?: {
    brierScore: number;
    ece: number;
    interpretacao: string;
    bins: number;
    amostras: number;
  };
  janelaOtima?: number;
};

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'generate') {
    const { modalidade, dezenasMarcadas, opcoes, quantidade, concursos, seed } = e.data.payload;

    try {
      const m = modalidadePorId(modalidade);

      // Adicionar concursos se fornecidos
      if (concursos && concursos.length > 0) {
        opcoes.concursos = concursos;
      }

      const resultado = generateGames(
        { modalidade, dezenasMarcadas, opcoes },
        quantidade,
        seed,
        0,
        (progress) => {
          self.postMessage({ type: 'progress', progress } as WorkerResponse);
        },
      );

      self.postMessage({
        type: 'result',
        games: resultado.games,
        meta: resultado.meta,
      } as WorkerResponse);
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      } as WorkerResponse);
    }
  }
};
