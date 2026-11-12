/**
 * Resumo educativo de cada jogo.
 * Referência: tasks_loteria.md — T4.6 (describe.ts)
 */

import { analyzeFibonacciDistribution } from './fibonacci';
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

  // Análise de Fibonacci (educativa, não altera probabilidade)
  const fibAnalysis = analyzeFibonacciDistribution(jogo.dezenas, modalidade.universo);
  const fibInfo =
    fibAnalysis.fibonacciCount > 0
      ? `${fibAnalysis.fibonacciCount} dezenas de Fibonacci (${fibAnalysis.fibonacciNumbers.join(', ')})`
      : 'Nenhuma dezena de Fibonacci';

  // Pares/ímpares
  const pares = jogo.dezenas.filter((d) => d % 2 === 0).length;
  const impares = jogo.dezenas.length - pares;

  // Soma
  const soma = jogo.dezenas.reduce((a, b) => a + b, 0);

  // Maior sequência consecutiva
  const sorted = [...jogo.dezenas].sort((a, b) => a - b);
  let maxSeq = 1;
  let currentSeq = 1;
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = sorted[i - 1];
    if ((current ?? 0) === (prev ?? 0) + 1) {
      currentSeq++;
      maxSeq = Math.max(maxSeq, currentSeq);
    } else {
      currentSeq = 1;
    }
  }

  const resumo = `Jogo com ${jogo.dezenas.length} dezenas (${pares} pares, ${impares} ímpares) · Soma: ${soma} · Maior sequência: ${maxSeq} · ${fibInfo} · Probabilidade de acertar todas: ${probabilidade}. Isto descreve o jogo; não altera sua probabilidade.`;

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
