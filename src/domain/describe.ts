/**
 * Resumo educativo de cada jogo.
 * Referência: tasks_loteria.md — T4.6 (describe.ts)
 */

import type { ModalidadeId } from './rules';
import { modalidadePorId } from './rules';

export const PALAVRAS_PROIBIDAS = [
  'garantido',
  'garantia',
  'ganhar',
  'lucro',
  'sorte',
  'milionario',
  'milionário',
] as const;

export interface DescricaoJogo {
  jogo: {
    dezenas: number[];
    id: string;
    timestamp: string;
  };
  modalidade: {
    nome: string;
    preco: string;
    universo: number;
    sorteio: number;
    probabilidade: string;
  };
  resumo: string;
}

/**
 * Gera uma descrição educativa de um jogo.
 */
export function descreverJogo(
  jogo: { dezenas: number[]; id: string; timestamp: string },
  modalidadeId: ModalidadeId,
): DescricaoJogo {
  const modalidade = modalidadePorId(modalidadeId);

  // Calcular probabilidade da Sena (maior premiação)
  const combinacoes = calcularCombinacoes(modalidade.universo, modalidade.dezenasSorteadas);
  const probabilidade = `1 em ${combinacoes.toLocaleString('pt-BR')}`;

  const resumo = `Combinação de ${jogo.dezenas.length} dezenas entre ${modalidade.universo} possíveis. Probabilidade de acertar todas: ${probabilidade}. Jogo educativo, sem promessa de premiação.`;

  return {
    jogo: {
      dezenas: jogo.dezenas,
      id: jogo.id,
      timestamp: jogo.timestamp,
    },
    modalidade: {
      nome: modalidade.nome,
      preco: modalidade.precoMinimo,
      universo: modalidade.universo,
      sorteio: modalidade.dezenasSorteadas,
      probabilidade,
    },
    resumo,
  };
}

/**
 * F1: C(n, k) = n! / (k! * (n-k)!)
 */
function calcularCombinacoes(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  if (k === 0 || k === n) return 1n;

  const kMin = k < n - k ? k : n - k;

  let numerador = 1n;
  let denominador = 1n;

  for (let i = 0; i < kMin; i++) {
    numerador *= BigInt(n - i);
    denominador *= BigInt(i + 1);
    // Simplificar a fração
    const mdc = calcularMdc(numerador, denominador);
    numerador /= mdc;
    denominador /= mdc;
  }

  return numerador / denominador;
}

function calcularMdc(a: bigint, b: bigint): bigint {
  let x = a;
  let y = b;
  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}
