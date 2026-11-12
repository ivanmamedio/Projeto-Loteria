/**
 * Funções utilitárias baseadas na sequência de Fibonacci.
 *
 * Princípio: A sequência de Fibonacci é um padrão matemático interessante
 * para análise de distribuição e espaçamento, mas NÃO confere vantagem
 * estatística em sorteios justos onde todas as combinações têm mesma probabilidade.
 */

// Caches para memoização
const _fibCache = new Map<number, number[]>();
const _fibFromOneCache = new Map<number, number[]>();

/**
 * Gera os primeiros n números da sequência de Fibonacci.
 * F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
 * @param n Quantidade de números a gerar (n >= 0)
 * @returns Array com os primeiros n números de Fibonacci
 */
export function fibonacci(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];

  const cached = _fibCache.get(n);
  if (cached) return cached;

  const seq: number[] = [0, 1];
  for (let i = 2; i < n; i++) {
    const prev1 = seq[i - 1];
    const prev2 = seq[i - 2];
    seq.push((prev1 ?? 0) + (prev2 ?? 0));
  }

  _fibCache.set(n, seq);
  return seq;
}

/**
 * Gera os primeiros n números de Fibonacci a partir de F(1) (omitindo F(0)).
 * @param n Quantidade de números a gerar (n >= 0)
 * @returns Array com os primeiros n números de Fibonacci a partir de 1
 */
export function fibonacciFromOne(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [1];

  const cachedOne = _fibFromOneCache.get(n);
  if (cachedOne) return cachedOne;

  const seq: number[] = [1, 1];
  for (let i = 2; i < n; i++) {
    const prev1 = seq[i - 1];
    const prev2 = seq[i - 2];
    seq.push((prev1 ?? 0) + (prev2 ?? 0));
  }

  _fibFromOneCache.set(n, seq);
  return seq;
}

/**
 * Retorna o n-ésimo número de Fibonacci (0-indexed: F(0)=0, F(1)=1).
 * Usa fórmula de Binet para O(1) com precisão até n ≈ 70.
 * Para n > 70, usa cálculo iterativo para evitar perda de precisão.
 */
export function fibonacciN(n: number): number {
  if (n < 0) throw new Error('Índice deve ser não-negativo');
  if (n === 0) return 0;
  if (n === 1) return 1;

  // Fórmula de Binet: F(n) = (φ^n - ψ^n) / √5
  // Preciso até n ≈ 70 com Number (IEEE 754)
  if (n <= 70) {
    const phi = razaoAurea;
    const psi = 1 - phi; // -1/φ
    return Math.round((phi ** n - psi ** n) / Math.sqrt(5));
  }

  // Iterativo para n > 70
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

/**
 * Verifica se um número pertence à sequência de Fibonacci.
 * Um número x pertence à sequência se 5*x² + 4 ou 5*x² - 4 for quadrado perfeito.
 * Usa BigInt para precisão arbitrária (evita problemas de ponto flutuante).
 */
export function isFibonacci(x: number): boolean {
  if (x < 0 || !Number.isInteger(x)) return false;
  if (x === 0 || x === 1) return true;

  const xBig = BigInt(x);
  const test1 = 5n * xBig * xBig + 4n;
  const test2 = 5n * xBig * xBig - 4n;

  return isPerfectSquare(test1) || isPerfectSquare(test2);
}

function isPerfectSquare(n: bigint): boolean {
  if (n < 0) return false;
  const root = integerSqrt(n);
  return root * root === n;
}

// Raiz quadrada inteira por método de Newton (rápido e preciso para BigInt)
function integerSqrt(n: bigint): bigint {
  if (n === 0n || n === 1n) return n;
  let x = n;
  let y = (n + 1n) >> 1n;
  while (y < x) {
    x = y;
    y = (x + n / x) >> 1n;
  }
  return x;
}

/**
 * Razão áurea (phi) aproximada: φ = (1 + √5) / 2 ≈ 1.6180339887...
 * A razão entre números consecutivos de Fibonacci tende a φ à medida que o índice aumenta.
 */
export const razaoAurea = (1 + Math.sqrt(5)) / 2;

/**
 * Calcula a razão entre dois números consecutivos de Fibonacci.
 * Útil para analisar convergência para φ.
 * @param n Índice (retorna F(n)/F(n-1)), requer n >= 2
 */
export function fibonacciRatio(n: number): number {
  if (n < 2) return Number.NaN;
  const seq = fibonacci(n + 1);
  const fn = seq[n];
  const fn_1 = seq[n - 1];
  return (fn ?? 0) / (fn_1 ?? 1);
}

/**
 * Gaps de Fibonacci: diferenças entre números consecutivos da sequência.
 * Útil para análise de espaçamento (teoria de matrizes aleatórias / repulsão de níveis).
 * @param n Quantidade de números da sequência para gerar gaps
 */
export function fibonacciGaps(n: number): number[] {
  if (n <= 1) return [];
  const seq = fibonacci(n);
  const gaps: number[] = [];
  for (let i = 1; i < seq.length; i++) {
    const current = seq[i];
    const prev = seq[i - 1];
    gaps.push((current ?? 0) - (prev ?? 0));
  }
  return gaps;
}

/**
 * Verifica quantos números de um array são de Fibonacci.
 * Retorna contagem e os próprios números.
 */
export function countFibonacciNumbers(numbers: number[]): { count: number; numbers: number[] } {
  const fibNumbers = numbers.filter(isFibonacci);
  return { count: fibNumbers.length, numbers: fibNumbers };
}

/**
 * Analisa a distribuição de números de Fibonacci em um sorteio.
 * Retorna métricas úteis para describe.ts (resumo educativo).
 */
export function analyzeFibonacciDistribution(
  dezenas: number[],
  universo: number,
): {
  fibonacciCount: number;
  fibonacciNumbers: number[];
  maxGap: number;
  avgGap: number;
  ratioToUniverse: number;
} {
  const { count, numbers } = countFibonacciNumbers(dezenas);
  const sorted = [...numbers].sort((a, b) => a - b);
  const gaps = sorted.length > 1 ? sorted.slice(1).map((v, i) => (v ?? 0) - (sorted[i] ?? 0)) : [];

  const maxGap = gaps.length > 0 ? Math.max(...gaps) : 0;
  const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

  // Quantos números de Fibonacci existem no universo
  const fibsInUniverse = fibonacciFromOne(50).filter((f) => f <= universo).length;

  return {
    fibonacciCount: count,
    fibonacciNumbers: numbers,
    maxGap,
    avgGap,
    ratioToUniverse: fibsInUniverse > 0 ? count / fibsInUniverse : 0,
  };
}

/**
 * Limpa caches (útil para testes ou liberação de memória).
 */
export function clearFibonacciCache(): void {
  _fibCache.clear();
  _fibFromOneCache.clear();
}
