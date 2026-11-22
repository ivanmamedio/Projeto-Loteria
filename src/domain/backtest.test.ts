import { describe, expect, it } from 'vitest';

import { backtestWalkForward } from './backtest';

describe('backtest', () => {
  it('backtestWalkForward returns valid structure', () => {
    // Histórico sintético pequeno para teste rápido
    const hist: number[][] = [];
    for (let i = 0; i < 120; i++) {
      const sorteio: number[] = [];
      while (sorteio.length < 15) {
        const d = Math.floor(Math.random() * 25) + 1;
        if (!sorteio.includes(d)) sorteio.push(d);
      }
      sorteio.sort((a, b) => a - b);
      hist.push(sorteio);
    }

    const result = backtestWalkForward(hist, 'lotofacil', 100, 10, ['E0'], 42);

    expect(result.modalidade).toBe('lotofacil');
    expect(result.universo).toBe(25);
    expect(result.k).toBe(15);
    expect(result.nTestes).toBe(10);
    expect(result.estrategiaUsada).toBe('E0');
    expect(result.janela).toBe(100);
    expect(typeof result.mediaAcertosObservada).toBe('number');
    expect(typeof result.mediaAcertosEsperada).toBe('number');
    expect(typeof result.taxaAceitacaoMedia).toBe('number');
    expect(result.quiQuadrado).toHaveProperty('chi2');
    expect(result.quiQuadrado).toHaveProperty('graus');
    expect(result.quiQuadrado).toHaveProperty('pValor');
  });

  it('backtestWalkForward throws on insufficient history', () => {
    const hist: number[][] = [];
    for (let i = 0; i < 50; i++) {
      const sorteio: number[] = [];
      while (sorteio.length < 15) {
        const d = Math.floor(Math.random() * 25) + 1;
        if (!sorteio.includes(d)) sorteio.push(d);
      }
      sorteio.sort((a, b) => a - b);
      hist.push(sorteio);
    }

    expect(() => backtestWalkForward(hist, 'lotofacil', 100, 10, ['E0'], 42)).toThrow();
  });

  it('backtestWalkForward is deterministic with same seed', () => {
    const hist: number[][] = [];
    for (let i = 0; i < 120; i++) {
      const sorteio: number[] = [];
      while (sorteio.length < 15) {
        const d = Math.floor(Math.random() * 25) + 1;
        if (!sorteio.includes(d)) sorteio.push(d);
      }
      sorteio.sort((a, b) => a - b);
      hist.push(sorteio);
    }

    const r1 = backtestWalkForward(hist, 'lotofacil', 100, 10, ['E0'], 42);
    const r2 = backtestWalkForward(hist, 'lotofacil', 100, 10, ['E0'], 42);

    expect(r1.mediaAcertosObservada).toBe(r2.mediaAcertosObservada);
    expect(r1.quiQuadrado.chi2).toBe(r2.quiQuadrado.chi2);
  });
});
