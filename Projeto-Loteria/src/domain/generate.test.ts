import { describe, expect, it } from 'vitest';

import { generateGames, parseRequest } from './generate';
import { mulberry32 } from './rng';

describe('generate', () => {
  it('parseRequest validates input', () => {
    expect(() => parseRequest(null)).toThrow();
    expect(() => parseRequest({})).toThrow();
    const request = parseRequest({ modalidade: 'mega-sena', dezenasMarcadas: [1, 2, 3, 4, 5, 6] });
    expect(request.modalidade).toBe('mega-sena');
    expect(request.dezenasMarcadas).toHaveLength(6);
  });

  it('parseRequest rejects invalid dezenas', () => {
    expect(() => parseRequest({ modalidade: 'mega-sena', dezenasMarcadas: [0] })).toThrow();
    expect(() => parseRequest({ modalidade: 'mega-sena', dezenasMarcadas: [] })).toThrow();
  });

  it('generateGames produces requested quantity', () => {
    const request = parseRequest({
      modalidade: 'mega-sena',
      dezenasMarcadas: [1, 2, 3, 4, 5, 6, 7, 8],
    });
    const games = generateGames(request, 2, mulberry32(5));
    expect(games).toHaveLength(2);
    for (const game of games) {
      expect(game.dezenas).toHaveLength(6);
      expect(new Set(game.dezenas).size).toBe(6);
    }
  });
});
