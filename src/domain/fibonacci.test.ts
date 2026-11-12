import { beforeEach, describe, expect, it } from 'vitest';
import {
  analyzeFibonacciDistribution,
  clearFibonacciCache,
  countFibonacciNumbers,
  fibonacci,
  fibonacciFromOne,
  fibonacciGaps,
  fibonacciN,
  fibonacciRatio,
  isFibonacci,
  razaoAurea,
} from './fibonacci';

describe('fibonacci', () => {
  beforeEach(() => {
    clearFibonacciCache();
  });

  it('gera sequência correta para casos base', () => {
    expect(fibonacci(0)).toEqual([]);
    expect(fibonacci(1)).toEqual([0]);
    expect(fibonacci(2)).toEqual([0, 1]);
  });

  it('gera sequência correta para n > 2', () => {
    expect(fibonacci(5)).toEqual([0, 1, 1, 2, 3]);
    expect(fibonacci(10)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
    expect(fibonacci(15)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377]);
  });

  it('memoização retorna mesma referência', () => {
    const a = fibonacci(10);
    const b = fibonacci(10);
    expect(a).toBe(b); // mesma referência do cache
  });

  it('cache é independente para tamanhos diferentes', () => {
    const a = fibonacci(5);
    const b = fibonacci(10);
    expect(a).not.toBe(b);
    expect(a.length).toBe(5);
    expect(b.length).toBe(10);
  });
});

describe('fibonacciFromOne', () => {
  beforeEach(() => {
    clearFibonacciCache();
  });

  it('omit F(0) e começa em 1', () => {
    expect(fibonacciFromOne(0)).toEqual([]);
    expect(fibonacciFromOne(1)).toEqual([1]);
    expect(fibonacciFromOne(2)).toEqual([1, 1]);
    expect(fibonacciFromOne(5)).toEqual([1, 1, 2, 3, 5]);
    expect(fibonacciFromOne(10)).toEqual([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
  });

  it('memoização funciona', () => {
    const a = fibonacciFromOne(10);
    const b = fibonacciFromOne(10);
    expect(a).toBe(b);
  });
});

describe('fibonacciN', () => {
  it('retorna n-ésimo número (0-indexed)', () => {
    expect(fibonacciN(0)).toBe(0);
    expect(fibonacciN(1)).toBe(1);
    expect(fibonacciN(2)).toBe(1);
    expect(fibonacciN(3)).toBe(2);
    expect(fibonacciN(4)).toBe(3);
    expect(fibonacciN(5)).toBe(5);
    expect(fibonacciN(6)).toBe(8);
    expect(fibonacciN(7)).toBe(13);
    expect(fibonacciN(10)).toBe(55);
    expect(fibonacciN(20)).toBe(6765);
  });

  it('lança erro para índice negativo', () => {
    expect(() => fibonacciN(-1)).toThrow('Índice deve ser não-negativo');
  });

  it('usa fórmula de Binet para n <= 70 e iterativo para n > 70', () => {
    // Ambos os caminhos devem dar o mesmo resultado na fronteira
    expect(fibonacciN(70)).toBe(190392490709135);
    expect(fibonacciN(71)).toBe(308061521170129);
    expect(fibonacciN(72)).toBe(498454011879264);
  });
});

describe('isFibonacci', () => {
  it('identifica números de Fibonacci clássicos', () => {
    expect(isFibonacci(0)).toBe(true);
    expect(isFibonacci(1)).toBe(true);
    expect(isFibonacci(2)).toBe(true);
    expect(isFibonacci(3)).toBe(true);
    expect(isFibonacci(5)).toBe(true);
    expect(isFibonacci(8)).toBe(true);
    expect(isFibonacci(13)).toBe(true);
    expect(isFibonacci(21)).toBe(true);
    expect(isFibonacci(34)).toBe(true);
    expect(isFibonacci(55)).toBe(true);
    expect(isFibonacci(89)).toBe(true);
    expect(isFibonacci(144)).toBe(true);
  });

  it('rejeita números que não são de Fibonacci', () => {
    expect(isFibonacci(4)).toBe(false);
    expect(isFibonacci(6)).toBe(false);
    expect(isFibonacci(7)).toBe(false);
    expect(isFibonacci(9)).toBe(false);
    expect(isFibonacci(10)).toBe(false);
    expect(isFibonacci(14)).toBe(false);
    expect(isFibonacci(15)).toBe(false);
    expect(isFibonacci(20)).toBe(false);
  });

  it('rejeita negativos e não-inteiros', () => {
    expect(isFibonacci(-1)).toBe(false);
    expect(isFibonacci(-5)).toBe(false);
    expect(isFibonacci(1.5)).toBe(false);
    expect(isFibonacci(2.7)).toBe(false);
    expect(isFibonacci(Number.NaN)).toBe(false);
  });

  it('funciona com números grandes via BigInt (precisão arbitrária)', () => {
    // F(50) = 12586269025
    expect(isFibonacci(12586269025)).toBe(true);
    expect(isFibonacci(12586269026)).toBe(false);

    // F(60) = 1548008755920
    expect(isFibonacci(1548008755920)).toBe(true);
    expect(isFibonacci(1548008755921)).toBe(false);

    // F(70) = 190392490709135
    expect(isFibonacci(190392490709135)).toBe(true);
    expect(isFibonacci(190392490709136)).toBe(false);
  });
});

describe('razaoAurea', () => {
  it('tem valor aproximado correto', () => {
    // φ = (1 + √5) / 2 ≈ 1.618033988749895
    expect(razaoAurea).toBeCloseTo(1.618033988749895, 12);
  });
});

describe('fibonacciRatio', () => {
  it('retorna NaN para n < 2', () => {
    expect(fibonacciRatio(0)).toBeNaN();
    expect(fibonacciRatio(1)).toBeNaN();
  });

  it('converge para φ conforme n aumenta', () => {
    expect(fibonacciRatio(2)).toBeCloseTo(1, 1); // 1/1 = 1
    expect(fibonacciRatio(3)).toBeCloseTo(2, 1); // 2/1 = 2
    expect(fibonacciRatio(4)).toBeCloseTo(1.5, 1); // 3/2 = 1.5
    expect(fibonacciRatio(5)).toBeCloseTo(1.667, 2); // 5/3 ≈ 1.667
    expect(fibonacciRatio(10)).toBeCloseTo(razaoAurea, 2);
    expect(fibonacciRatio(20)).toBeCloseTo(razaoAurea, 5);
  });
});

describe('fibonacciGaps', () => {
  it('retorna array vazio para n <= 1', () => {
    expect(fibonacciGaps(0)).toEqual([]);
    expect(fibonacciGaps(1)).toEqual([]);
  });

  it('calcula gaps corretamente', () => {
    // F: 0, 1, 1, 2, 3, 5, 8, 13...
    // gaps: 1, 0, 1, 1, 2, 3, 5...
    expect(fibonacciGaps(2)).toEqual([1]);
    expect(fibonacciGaps(3)).toEqual([1, 0]);
    expect(fibonacciGaps(5)).toEqual([1, 0, 1, 1]);
    expect(fibonacciGaps(8)).toEqual([1, 0, 1, 1, 2, 3, 5]);
  });
});

describe('countFibonacciNumbers', () => {
  it('conta corretamente números de Fibonacci', () => {
    expect(countFibonacciNumbers([1, 2, 3, 4, 5])).toEqual({ count: 4, numbers: [1, 2, 3, 5] });
    expect(countFibonacciNumbers([4, 6, 7, 9, 10])).toEqual({ count: 0, numbers: [] });
    expect(countFibonacciNumbers([13, 21, 34, 55])).toEqual({
      count: 4,
      numbers: [13, 21, 34, 55],
    });
    expect(countFibonacciNumbers([])).toEqual({ count: 0, numbers: [] });
  });
});

describe('analyzeFibonacciDistribution', () => {
  it('analisa distribuição para Mega-Sena (universo 60)', () => {
    const dezenas = [1, 2, 3, 5, 8, 13]; // todos Fibonacci
    const result = analyzeFibonacciDistribution(dezenas, 60);
    expect(result.fibonacciCount).toBe(6);
    expect(result.fibonacciNumbers).toEqual([1, 2, 3, 5, 8, 13]);
    expect(result.maxGap).toBe(5); // 13 - 8 = 5
    expect(result.avgGap).toBeCloseTo(2.4, 1); // (1+1+2+3+5)/5 = 2.4
    // Fibonacci até 60: 1,1,2,3,5,8,13,21,34,55 = 10 números únicos (1 conta uma vez)
    expect(result.ratioToUniverse).toBeCloseTo(6 / 10, 2);
  });

  it('analisa distribuição para Lotofácil (universo 25)', () => {
    const dezenas = [4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 22];
    const result = analyzeFibonacciDistribution(dezenas, 25);
    // Fibonacci até 25: 1,2,3,5,8,13,21 = 7 números
    // Neste jogo: nenhum é Fibonacci
    expect(result.fibonacciCount).toBe(0);
    expect(result.fibonacciNumbers).toEqual([]);
    expect(result.maxGap).toBe(0);
    expect(result.avgGap).toBe(0);
    expect(result.ratioToUniverse).toBe(0);
  });

  it('analisa distribuição mista', () => {
    const dezenas = [1, 4, 7, 10, 13, 16, 19, 21, 24];
    const result = analyzeFibonacciDistribution(dezenas, 25);
    // Fibonacci: 1, 13, 21 = 3
    expect(result.fibonacciCount).toBe(3);
    expect(result.fibonacciNumbers).toEqual([1, 13, 21]);
    // gaps: 13-1=12, 21-13=8 -> max=12, avg=(12+8)/2=10
    expect(result.maxGap).toBe(12);
    expect(result.avgGap).toBeCloseTo(10, 1);
  });

  it('lida com array vazio', () => {
    const result = analyzeFibonacciDistribution([], 60);
    expect(result.fibonacciCount).toBe(0);
    expect(result.maxGap).toBe(0);
    expect(result.avgGap).toBe(0);
  });
});

describe('clearFibonacciCache', () => {
  it('limpa ambos os caches', () => {
    const a = fibonacci(10);
    const b = fibonacciFromOne(10);
    clearFibonacciCache();
    const c = fibonacci(10);
    const d = fibonacciFromOne(10);
    expect(a).not.toBe(c);
    expect(b).not.toBe(d);
  });
});
