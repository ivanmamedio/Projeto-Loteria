/**
 * Guards e validação de entradas para o domínio.
 */

import { modalidadePorId } from './rules';
import type { ModalidadeId } from './types';

export interface ValidacaoResultado {
  valido: boolean;
  erro?: string;
}

/** Valida se dezenas estão dentro do universo da modalidade */
export function validarDezenasUniverso(modalidade: ModalidadeId, dezenas: number[]): ValidacaoResultado {
  const regras = modalidadePorId(modalidade);
  const min = regras.id === 'lotomania' ? 0 : 1;
  const max = regras.universo;

  for (const d of dezenas) {
    if (!Number.isInteger(d) || d < min || d > max) {
      return { valido: false, erro: `Dezena ${d} fora do universo [${min}, ${max}] para ${regras.nome}` };
    }
  }

  const unicos = new Set(dezenas);
  if (unicos.size !== dezenas.length) {
    return { valido: false, erro: 'Dezenas duplicadas não são permitidas' };
  }

  return { valido: true };
}

/** Valida estrutura do histórico */
export function validarHistorico(historico: number[][], modalidade: ModalidadeId): ValidacaoResultado {
  if (historico.length === 0) return { valido: true };
  
  const regras = modalidadePorId(modalidade);
  const tamanhoEsperado = regras.dezenasSorteadas;
  const min = regras.id === 'lotomania' ? 0 : 1;
  const max = regras.universo;

  for (let i = 0; i < historico.length; i++) {
    const sorteio = historico[i];
    if (!Array.isArray(sorteio)) {
      return { valido: false, erro: `Sorteio ${i} não é um array` };
    }
    if (sorteio.length !== tamanhoEsperado) {
      return { valido: false, erro: `Sorteio ${i} tem ${sorteio.length} dezenas, esperado ${tamanhoEsperado}` };
    }
    for (const d of sorteio) {
      if (!Number.isInteger(d) || d < min || d > max) {
        return { valido: false, erro: `Sorteio ${i}: dezena ${d} fora do universo [${min}, ${max}]` };
      }
    }
    const unicos = new Set(sorteio);
    if (unicos.size !== sorteio.length) {
      return { valido: false, erro: `Sorteio ${i} contém dezenas duplicadas` };
    }
  }

  return { valido: true };
}

/** Valida parâmetros de geração */
export function validarParametrosGeracao(
  modalidade: ModalidadeId,
  dezenasMarcadas: number[],
  tamanhoAposta?: number,
  quantidade?: number
): ValidacaoResultado {
  const regras = modalidadePorId(modalidade);

  if (dezenasMarcadas.length < regras.minDezenas) {
    return { valido: false, erro: `Mínimo ${regras.minDezenas} dezenas necessárias para ${regras.nome}` };
  }
  if (dezenasMarcadas.length > regras.maxDezenas) {
    return { valido: false, erro: `Máximo ${regras.maxDezenas} dezenas permitidas para ${regras.nome}` };
  }

  const validacaoDezenas = validarDezenasUniverso(modalidade, dezenasMarcadas);
  if (!validacaoDezenas.valido) return validacaoDezenas;

  if (tamanhoAposta !== undefined) {
    if (!Number.isInteger(tamanhoAposta) || tamanhoAposta < regras.minDezenas || tamanhoAposta > regras.maxDezenas) {
      return { valido: false, erro: `Tamanho de aposta inválido: ${tamanhoAposta} (válido: ${regras.minDezenas}-${regras.maxDezenas})` };
    }
    if (tamanhoAposta > dezenasMarcadas.length) {
      return { valido: false, erro: `Tamanho da aposta (${tamanhoAposta}) maior que dezenas marcadas (${dezenasMarcadas.length})` };
    }
  }

  if (quantidade !== undefined) {
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 10) {
      return { valido: false, erro: 'Quantidade deve ser entre 1 e 10' };
    }
  }

  return { valido: true };
}

/** Sanitiza array de números (remove NaN, Infinity, duplicatas, ordena) */
export function sanitizarDezenas(dezenas: unknown[]): number[] {
  return dezenas
    .map(x => Number(x))
    .filter(x => Number.isInteger(x) && Number.isFinite(x))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a - b);
}

/** Verifica se um jogo passa nos filtros básicos de sanidade */
export function validarJogoGerado(dezenas: number[], modalidade: ModalidadeId): boolean {
  const regras = modalidadePorId(modalidade);
  const min = regras.id === 'lotomania' ? 0 : 1;
  const max = regras.universo;
  
  if (dezenas.length !== regras.dezenasSorteadas && dezenas.length < regras.minDezenas) return false;
  if (dezenas.length > regras.maxDezenas) return false;
  
  const unicos = new Set(dezenas);
  if (unicos.size !== dezenas.length) return false;
  
  for (const d of dezenas) {
    if (d < min || d > max) return false;
  }
  
  return true;
}