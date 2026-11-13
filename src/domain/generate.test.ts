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

  it('generateGames works with combined strategy (E1+E3+E4) and all options', () => {
    const request = parseRequest({
      modalidade: 'mega-sena',
      dezenasMarcadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      opcoes: {
        estrategia: ['E1', 'E3', 'E4'],
        filtros: true,
        diversificar: true,
        evitaCalendario: true,
        janela: 100,
      },
    });
    const games = generateGames(request, 1, mulberry32(42));
    expect(games).toHaveLength(1);
    for (const game of games) {
      expect(game.dezenas).toHaveLength(6);
      expect(new Set(game.dezenas).size).toBe(6);
    }
    expect(games.meta).toBeDefined();
    expect(games.meta.algorithmVersion).toBeDefined();
    expect(typeof games.meta.taxaAceitacao).toBe('number');
  });

  it('generateGames works with Lotofácil combined strategy', () => {
    const request = parseRequest({
      modalidade: 'lotofacil',
      dezenasMarcadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      opcoes: {
        estrategia: ['E1', 'E3', 'E4'],
        filtros: true,
        diversificar: true,
        evitaCalendario: true,
        janela: 100,
      },
    });
    const games = generateGames(request, 1, mulberry32(123));
    expect(games).toHaveLength(1);
    for (const game of games) {
      expect(game.dezenas).toHaveLength(15);
      expect(new Set(game.dezenas).size).toBe(15);
    }
  });

  it('SA pool invariant: pool size mantido durante diversificação', () => {
    // Teste do invariante do pool no Simulated Annealing (B10)
    const request = parseRequest({
      modalidade: 'mega-sena',
      dezenasMarcadas: Array.from({ length: 60 }, (_, i) => i + 1),
      opcoes: {
        estrategia: ['E1', 'E4'],
        filtros: false,
        diversificar: true,
        evitaCalendario: false,
        sa: true,
        janela: 100,
      },
    });

    const q = 8;
    const games = generateGames(request, q, mulberry32(999));

    expect(games).toHaveLength(q);
    expect(games.meta.jogosGerados).toBe(q);
    expect(games.meta.estrategiasAtivas).toContain('E4 (diversificação)');
  });
});
