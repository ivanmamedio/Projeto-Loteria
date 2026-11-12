import { describe, expect, it } from 'vitest';
import { fibonacciFromOne } from './fibonacci';
import { fibonacciPesos, patternWeights } from './patterns';

describe('fibonacciPesos', () => {
  const createContext = (
    overrides: {
      historico?: number[][];
      universo?: number;
      dezenasValidas?: number[];
      k?: number;
      fibonacciIntensidade?: number;
    } = {},
  ): Parameters<typeof fibonacciPesos>[0] => {
    const base = {
      historico: overrides.historico ?? [],
      universo: overrides.universo ?? 60,
      dezenasValidas: overrides.dezenasValidas ?? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      k: overrides.k ?? 6,
    };
    if (overrides.fibonacciIntensidade !== undefined) {
      return { ...base, fibonacciIntensidade: overrides.fibonacciIntensidade };
    }
    return base;
  };

  it('retorna pesos neutros (1) quando não há histórico', () => {
    const ctx = createContext({ historico: [] });
    const pesos = fibonacciPesos(ctx);
    expect(pesos.every((p) => p === 1)).toBe(true);
  });

  it('ajusta pesos baseado na proporção histórica de Fibonacci', () => {
    // Universo 25 (Lotofácil): Fibonacci = 1,2,3,5,8,13,21 (7 números)
    // Teórico: 7/25 = 0.28
    // Histórico com MUITOS Fibonacci (simula viés)
    const historicoComMuitosFib = [
      [1, 2, 3, 5, 8, 13, 21, 4, 6, 7], // 7 de 10 são Fibonacci
      [1, 2, 3, 5, 8, 13, 21, 9, 10, 11],
      [1, 2, 3, 5, 8, 13, 21, 12, 14, 15],
    ];

    const ctx = createContext({
      universo: 25,
      dezenasValidas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      historico: historicoComMuitosFib,
    });

    const pesos = fibonacciPesos(ctx);

    // Fibonacci numbers: 1,2,3,5,8,13
    // Não-Fibonacci: 4,6,7,9,10,11,12,14,15
    // Como histórico tem MAIS Fibonacci que o esperado (0.7 > 0.28),
    // Fibonacci deve ter peso MENOR (1 - 0.15 = 0.85)
    // Não-Fibonacci deve ter peso MAIOR (1 + 0.15 = 1.15)

    const fibNumbers = new Set(fibonacciFromOne(50).filter((f) => f <= 25));
    for (const [i, d] of ctx.dezenasValidas.entries()) {
      const isFib = fibNumbers.has(d);
      if (isFib) {
        expect(pesos[i]).toBeCloseTo(0.85, 2);
      } else {
        expect(pesos[i]).toBeCloseTo(1.15, 2);
      }
    }
  });

  it('inverte viés quando histórico tem POUCOS Fibonacci', () => {
    // Histórico com POUCOS Fibonacci
    const historicoComPoucosFib = [
      [4, 6, 7, 9, 10, 11, 12, 14, 15, 16], // 0 de 10 são Fibonacci
      [17, 18, 19, 20, 22, 23, 24, 25, 4, 6], // 0 de 10
      [7, 9, 10, 11, 12, 14, 15, 16, 17, 18], // 0 de 10
    ];

    const ctx = createContext({
      universo: 25,
      dezenasValidas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      historico: historicoComPoucosFib,
    });

    const pesos = fibonacciPesos(ctx);

    // Histórico tem 0% Fibonacci < 28% teórico
    // Fibonacci deve ter peso MAIOR (1 + 0.15 = 1.15)
    // Não-Fibonacci deve ter peso MENOR (1 - 0.15 = 0.85)

    const fibNumbers = new Set(fibonacciFromOne(50).filter((f) => f <= 25));
    for (const [i, d] of ctx.dezenasValidas.entries()) {
      const isFib = fibNumbers.has(d);
      if (isFib) {
        expect(pesos[i]).toBeCloseTo(1.15, 2);
      } else {
        expect(pesos[i]).toBeCloseTo(0.85, 2);
      }
    }
  });

  it('funciona com Mega-Sena (universo 60)', () => {
    // Mega-Sena: Fibonacci até 60 = 1,2,3,5,8,13,21,34,55 (9 números)
    // Teórico: 9/60 = 0.15
    const ctx = createContext({
      universo: 60,
      dezenasValidas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 21, 34, 55, 60],
      historico: [
        [1, 2, 3, 5, 8, 13], // 6 de 6 são Fibonacci = 100%
        [21, 34, 55, 4, 6, 7], // 3 de 6 = 50%
      ],
    });

    const pesos = fibonacciPesos(ctx);

    const fibNumbers = new Set(fibonacciFromOne(50).filter((f) => f <= 60));
    for (const [i, d] of ctx.dezenasValidas.entries()) {
      const isFib = fibNumbers.has(d);
      // Histórico tem muito Fibonacci > teórico, então Fibonacci = 0.85
      if (isFib) {
        expect(pesos[i]).toBeCloseTo(0.85, 2);
      } else {
        expect(pesos[i]).toBeCloseTo(1.15, 2);
      }
    }
  });

  it('peso mínimo não cai abaixo de 0.7 (bias de 0.15)', () => {
    const ctx = createContext({
      universo: 25,
      dezenasValidas: [1, 2, 3, 4, 5],
      historico: Array(20).fill([1, 2, 3, 5, 8, 13, 21, 4, 6, 7]), // extremo
    });

    const pesos = fibonacciPesos(ctx);
    expect(Math.min(...pesos)).toBeGreaterThanOrEqual(0.85);
    expect(Math.max(...pesos)).toBeLessThanOrEqual(1.15);
  });

  it('respeita intensidade suave (0.5 = ±7.5%)', () => {
    const historicoComMuitosFib = [
      [1, 2, 3, 5, 8, 13, 21, 4, 6, 7],
      [1, 2, 3, 5, 8, 13, 21, 9, 10, 11],
    ];

    const ctx = createContext({
      universo: 25,
      dezenasValidas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      historico: historicoComMuitosFib,
      fibonacciIntensidade: 0.5, // Suave
    });

    const pesos = fibonacciPesos(ctx);
    const fibNumbers = new Set(fibonacciFromOne(50).filter((f) => f <= 25));

    for (const [i, d] of ctx.dezenasValidas.entries()) {
      const isFib = fibNumbers.has(d);
      if (isFib) {
        expect(pesos[i]).toBeCloseTo(0.925, 3); // 1 - 0.075
      } else {
        expect(pesos[i]).toBeCloseTo(1.075, 3); // 1 + 0.075
      }
    }
  });

  it('respeita intensidade forte (2.0 = ±30%)', () => {
    const historicoComPoucosFib = [
      [4, 6, 7, 9, 10, 11, 12, 14, 15, 16],
      [17, 18, 19, 20, 22, 23, 24, 25, 4, 6],
    ];

    const ctx = createContext({
      universo: 25,
      dezenasValidas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      historico: historicoComPoucosFib,
      fibonacciIntensidade: 2.0, // Forte
    });

    const pesos = fibonacciPesos(ctx);
    const fibNumbers = new Set(fibonacciFromOne(50).filter((f) => f <= 25));

    for (const [i, d] of ctx.dezenasValidas.entries()) {
      const isFib = fibNumbers.has(d);
      if (isFib) {
        expect(pesos[i]).toBeCloseTo(1.3, 2); // 1 + 0.30
      } else {
        expect(pesos[i]).toBeCloseTo(0.7, 2); // 1 - 0.30
      }
    }
  });

  it('usa intensidade padrão (1.0) quando não especificada', () => {
    const historicoComMuitosFib = [
      [1, 2, 3, 5, 8, 13, 21, 4, 6, 7],
      [1, 2, 3, 5, 8, 13, 21, 9, 10, 11],
    ];

    const ctx = createContext({
      universo: 25,
      dezenasValidas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      historico: historicoComMuitosFib,
      // sem fibonacciIntensidade
    });

    const pesos = fibonacciPesos(ctx);
    const fibNumbers = new Set(fibonacciFromOne(50).filter((f) => f <= 25));

    for (const [i, d] of ctx.dezenasValidas.entries()) {
      const isFib = fibNumbers.has(d);
      if (isFib) {
        expect(pesos[i]).toBeCloseTo(0.85, 2); // default 1.0
      } else {
        expect(pesos[i]).toBeCloseTo(1.15, 2);
      }
    }
  });
});

describe('patternWeights com fibonacciPesos', () => {
  const createContext = (historico: number[][] = []) => ({
    historico,
    universo: 25,
    dezenasValidas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    k: 15,
  });

  it('inclui fator Fibonacci na combinação de pesos', () => {
    // Histórico com viés forte para Fibonacci
    const historico = [
      [1, 2, 3, 5, 8, 13, 21, 4, 6, 7, 9, 10, 11, 12, 14],
      [1, 2, 3, 5, 8, 13, 21, 15, 16, 17, 18, 19, 20, 22, 23],
      [1, 2, 3, 5, 8, 13, 21, 24, 25, 4, 6, 7, 9, 10, 11],
    ];

    const ctx = createContext(historico);
    const pesos = patternWeights(ctx);

    // Deve retornar array do mesmo tamanho
    expect(pesos.length).toBe(ctx.dezenasValidas.length);

    // Todos os pesos devem ser positivos
    expect(pesos.every((p) => p > 0)).toBe(true);

    // Média deve ser ~1 (normalizado)
    const media = pesos.reduce((a, b) => a + b, 0) / pesos.length;
    expect(media).toBeCloseTo(1, 1);
  });

  it('funciona sem histórico (todos os fatores neutros)', () => {
    const ctx = createContext([]);
    const pesos = patternWeights(ctx);

    expect(pesos.length).toBe(ctx.dezenasValidas.length);
    expect(pesos.every((p) => p > 0)).toBe(true);
  });
});
