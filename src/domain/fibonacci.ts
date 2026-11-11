/**
 * Funcoes utilitarias baseadas na sequencia de Fibonacci.
 *
 * Princpio: A sequencia de Fibonacci e um padrao matematico interessante
 * para analise de distribuicao e espacamento, mas nao confere vantagem
 * estatistica em sorteios justos onde todas as combinacoes tem mesma probabilidade.
 */

/**
 * Gera os primeiros n numeros da sequencia de Fibonacci.
 * F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
 * @param n Quantidade de numeros a gerar (n >= 0)
 * @returns Array com os primeiros n numeros de Fibonacci
 */
export function fibonacci(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];

  const seq: number[] = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(((seq as any)[i - 1]) + ((seq as any)[i - 2]));
  }
  return seq;
}

/**
 * Gera os primeiros n numeros de Fibonacci a partir de F(1) (omitindo F(0)).
 * @param n Quantidade de numeros a gerar (n >= 0)
 * @returns Array com os primeiros n numeros de Fibonacci a partir de 1
 */
export function fibonacciApartirDeUm(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [1];

  const seq: number[] = [1, 1];
  for (let i = 2; i < n; i++) {
    seq.push(((seq as any)[i - 1]) + ((seq as any)[i - 2]));
  }
  return seq;
}

/**
 * Verifica se um numero pertence a sequencia de Fibonacci.
 * Um numero x pertence a sequencia se 5*x^2 + 4 ou 5*x^2 - 4 for quadrado perfeito.
 */
export function eFibonacci(x: number): boolean {
  if (x < 0) return false;
  const test1 = 5 * x * x + 4;
  const test2 = 5 * x * x - 4;
  const sqrt1 = Math.sqrt(test1);
  const sqrt2 = Math.sqrt(test2);
  return sqrt1 === Math.floor(sqrt1) || sqrt2 === Math.floor(sqrt2);
}

/**
 * Razao aurea (phi) aproximada: phi = (1 + sqrt(5)) / 2 ~ 1.6180339887...
 * A razao entre numeros consecutivos de Fibonacci tende a phi ao medida que o indice aumenta.
 */
export const razaoAurora = (1 + Math.sqrt(5)) / 2;
