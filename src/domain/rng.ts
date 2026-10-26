/**
 * Gerador de números aleatórios para o domínio.
 * Referência: tasks_loteria.md — F10 (amostragem sem reposição)
 *
 * Implementação: mulberry32 + seed.
 * Uso: passar `rng: () => number` para funções que exigem aleatoriedade.
 * NUNCA usar Math.random() solto no domínio.
 */

export type Rng = () => number; // [0, 1)

export interface IRandom {
  next(): number; // [0, 1)
  seed(seed: number): void;
}

/**
 * Mulberry32 — generator de uint32 cujo float em [0,1) é devolvido por next().
 * O resultado é chamável (`rng()`) E possui `.next()`/`.seed()`, compatível
 * tanto com a referência da spec quanto com o estilo objeto do repositório.
 */
export function mulberry32(a: number): IRandom & Rng {
  let state = a >>> 0;

  const advance = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const callable = (): number => advance();
  (callable as unknown as IRandom).next = () => advance();
  (callable as unknown as IRandom).seed = (s: number) => {
    state = s >>> 0;
  };
  return callable as IRandom & Rng;
}

/**
 * Gera um seed a partir de Date.now() + crypto.getRandomValues (se disponível).
 * Devolve um número inteiro positivo abaixo de 2^32.
 */
export function newSeed(): number {
  const now = Date.now();
  const bits = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bits);
  }
  return (now ^ Number(bits[0])) >>> 0;
}
