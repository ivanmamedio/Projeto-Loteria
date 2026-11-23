// Web Worker para geração de jogos (não bloqueia UI principal)
// Compilado como módulo separado para Astro

import { generateGames } from '../domain/generate';
import { type ModalidadeId, modalidadePorId } from '../domain/rules';

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

    console.log('[Worker] Iniciando geração', { modalidade, quantidade, opcoes });

    try {
      // Validar modalidade
      modalidadePorId(modalidade);

      // Adicionar concursos se fornecidos
      if (concursos && concursos.length > 0) {
        opcoes.concursos = concursos;
      }

      const resultado = generateGames(
        { modalidade, dezenasMarcadas, opcoes },
        quantidade,
        seed,
        0,
        (progress: ProgressData) => {
          console.log('[Worker] Progresso:', progress);
          self.postMessage({ type: 'progress', progress } as WorkerResponse);
        },
      );

      console.log('[Worker] Geração concluída', { jogosGerados: resultado.games.length });

      // Transformar para o formato esperado pelo worker
      const gamesResult = resultado.games.map((g) => ({
        dezenas: g.dezenas,
        meta: { janela: resultado.meta.janela, taxaAceitacao: resultado.meta.taxaAceitacao },
      }));
      const metaResult = {
        algorithmVersion: resultado.meta.algorithmVersion,
        seed: resultado.meta.seed,
        janela: resultado.meta.janela,
        taxaAceitacao: resultado.meta.taxaAceitacao,
        estrategiasAtivas: resultado.meta.estrategiasAtivas,
        tamanhoAposta: resultado.meta.tamanhoAposta,
        dezenasMarcadas: resultado.meta.dezenasMarcadas,
        universo: resultado.meta.universo,
        tentativas: resultado.meta.tentativas,
        jogosGerados: resultado.meta.jogosGerados,
        cacheHits: resultado.meta.cacheHits,
        cacheSize: resultado.meta.cacheSize,
        fallbackDepth: resultado.meta.fallbackDepth,
        calibracao: resultado.meta.calibracao,
        janelaOtima: resultado.meta.janelaOtima,
      };

      self.postMessage({
        type: 'result',
        games: gamesResult,
        meta: metaResult,
      } as WorkerResponse);
    } catch (err) {
      console.error('[Worker] Erro:', err);
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      } as WorkerResponse);
    }
  }
};
