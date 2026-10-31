/**
 * Regras oficiais das 4 modalidades de loteria da CAIXA.
 *
 * Fonte oficial: https://loterias.caixa.gov.br/ — consultada em 2026-10-23.
 * Campos extraídos das páginas "Como jogar"/"Apostas" de cada modalidade:
 *   - Mega-Sena:     https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx
 *   - Lotofácil:     https://loterias.caixa.gov.br/Paginas/LOTOFACIL.aspx
 *   - Quina:         https://loterias.caixa.gov.br/Paginas/QUINA.aspx
 *   - Lotomania:     https://loterias.caixa.gov.br/Paginas/Lotomania.aspx
 *
 * Definições:
 *   - universo: quantidade de dezenas disponíveis no volante de apostas.
 *   - dezenasSorteadas: quantidade de dezenas que a CAIXA extrai no sorteio.
 *   - minDezenas / maxDezenas: faixa de dezenas que o apostador pode marcar.
 *   - premiacao: faixas de prêmio, por quantidade de acertos.
 *   - concursosTeimosinha: quantidade de concursos consecutivos para a teimosinha.
 */

import type { ModalidadeId } from './types';

export type { ModalidadeId };

export interface Premiacao {
  readonly aceitos: number;
  readonly descricao: string;
}

export interface ModalidadeRegras {
  readonly id: ModalidadeId;
  readonly nome: string;
  readonly universo: number;
  readonly dezenasSorteadas: number;
  readonly minDezenas: number;
  readonly maxDezenas: number;
  readonly premiacao: readonly Premiacao[];
  readonly concursosTeimosinha: readonly number[];
  readonly precoMinimo: string;
}

/**
 * Regras oficiais da CAIXA, confirmadas em 2026-10-23.
 *
 * Limites de aposta (volante):
 *   - Mega-Sena:     6 a 20 dezenas (1, 6 = R$ 6,00; mais de 6 = R$ 6,00 por combinação de 6)
 *   - Lotofácil:     15 a 20 dezenas (15 = R$ 3,50; mais de 15 = R$ 3,50 por combinação)
 *   - Quina:         5 a 15 dezenas (5 = R$ 3,00; mais de 5 = R$ 3,00 por combinação)
 *   - Lotomania:     50 dezenas fixo (R$ 3,00 único preço)
 */
export const MODALIDADES: ReadonlyArray<ModalidadeRegras> = [
  {
    id: 'mega-sena',
    nome: 'Mega-Sena',
    universo: 60,
    dezenasSorteadas: 6,
    minDezenas: 6,
    maxDezenas: 20,
    precoMinimo: 'R$ 6,00',
    premiacao: [
      { aceitos: 6, descricao: 'Sena' },
      { aceitos: 5, descricao: 'Quina' },
      { aceitos: 4, descricao: 'Quadra' },
    ],
    concursosTeimosinha: [2, 3, 4, 6, 8, 9, 12],
  },
  {
    id: 'lotofacil',
    nome: 'Lotofácil',
    universo: 25,
    dezenasSorteadas: 15,
    minDezenas: 15,
    maxDezenas: 20,
    precoMinimo: 'R$ 3,50',
    premiacao: [
      { aceitos: 15, descricao: '15 acertos' },
      { aceitos: 14, descricao: '14 acertos' },
      { aceitos: 13, descricao: '13 acertos' },
      { aceitos: 12, descricao: '12 acertos' },
      { aceitos: 11, descricao: '11 acertos' },
    ],
    concursosTeimosinha: [2, 3, 4, 6, 8, 9, 12, 18, 24],
  },
  {
    id: 'quina',
    nome: 'Quina',
    universo: 80,
    dezenasSorteadas: 5,
    minDezenas: 5,
    maxDezenas: 15,
    precoMinimo: 'R$ 3,00',
    premiacao: [
      { aceitos: 5, descricao: 'Quina' },
      { aceitos: 4, descricao: 'Quadra' },
      { aceitos: 3, descricao: 'Terno' },
      { aceitos: 2, descricao: 'Duque' },
    ],
    concursosTeimosinha: [3, 6, 12, 18, 24],
  },
  {
    id: 'lotomania',
    nome: 'Lotomania',
    universo: 100,
    dezenasSorteadas: 20,
    minDezenas: 50,
    maxDezenas: 50,
    precoMinimo: 'R$ 3,00',
    premiacao: [
      { aceitos: 20, descricao: '20 acertos' },
      { aceitos: 19, descricao: '19 acertos' },
      { aceitos: 18, descricao: '18 acertos' },
      { aceitos: 17, descricao: '17 acertos' },
      { aceitos: 16, descricao: '16 acertos' },
      { aceitos: 15, descricao: '15 acertos' },
      { aceitos: 0, descricao: '0 acertos' },
    ],
    concursosTeimosinha: [2, 3, 4, 6, 8, 9, 12],
  },
];

/** Recupera as regras de uma modalidade pelo seu ID. */
export function modalidadePorId(id: ModalidadeId): ModalidadeRegras {
  const regras = MODALIDADES.find((modalidade) => modalidade.id === id);
  if (!regras) {
    throw new Error(`Modalidade desconhecida: ${id}`);
  }
  return regras;
}

// Spec-aligned rules table (reference implementation from tasks_loteria.md §5.6)
export const RULES = {
  'mega-sena': {
    name: 'Mega-Sena',
    min: 1,
    max: 60,
    drawSize: 6,
    bet: { min: 6, max: 20, default: 6 },
  },
  lotofacil: {
    name: 'Lotofácil',
    min: 1,
    max: 25,
    drawSize: 15,
    bet: { min: 15, max: 20, default: 15 },
  },
  quina: { name: 'Quina', min: 1, max: 80, drawSize: 5, bet: { min: 5, max: 15, default: 5 } },
  lotomania: {
    name: 'Lotomania',
    min: 0,
    max: 99,
    drawSize: 20,
    bet: { min: 50, max: 50, default: 50 },
  },
} as const;
