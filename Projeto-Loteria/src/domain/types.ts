export type ModalidadeId = 'mega-sena' | 'lotofacil' | 'quina' | 'lotomania';

export interface Draw {
  readonly concurso: number;
  readonly data: string;
  readonly dezenas: readonly number[];
}

export interface GameRequest {
  readonly modalidade: ModalidadeId;
  readonly dezenasMarcadas: readonly number[];
  readonly quantidade?: number;
  readonly tamanhoAposta?: number;
  readonly opcoes?: Record<string, unknown>;
}

export interface Game {
  readonly id: string;
  readonly dezenas: readonly number[];
  readonly timestamp: string;
  readonly modalidade: ModalidadeId;
}

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };
