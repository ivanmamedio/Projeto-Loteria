/**
 * Parse e validação da request de geração.
 */

import { modalidadePorId } from '../rules';
import type { GameRequest, ModalidadeId } from '../types';

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
