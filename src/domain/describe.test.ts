import { describe, expect, it } from 'vitest';

import { PALAVRAS_PROIBIDAS, descreverJogo } from './describe';

describe('describe', () => {
  it('descreverJogo returns structured description', () => {
    const result = descreverJogo(
      { dezenas: [1, 2, 3, 4, 5, 6], id: 'g1', timestamp: '2026-01-01T00:00:00.000Z' },
      'mega-sena',
    );
    expect(result.jogo.id).toBe('g1');
    expect(result.modalidade.nome).toBe('Mega-Sena');
    expect(result.modalidade.probabilidade).toContain('1 em');
    expect(typeof result.resumo).toBe('string');
  });

  it('resumo does not contain prohibited words', () => {
    const result = descreverJogo(
      { dezenas: [1, 2, 3, 4, 5, 6], id: 'g1', timestamp: '2026-01-01T00:00:00.000Z' },
      'mega-sena',
    );
    const lower = result.resumo.toLowerCase();
    for (const word of PALAVRAS_PROIBIDAS) {
      expect(lower).not.toContain(word.toLowerCase());
    }
  });
});
