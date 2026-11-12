/**
 * F4-F7 e F13 - Estatisticas do historico.
 * Referencia: tasks_loteria.md - F4-F7 e F13 (frequencia, atraso, z, chi2, soma, paridade)
 *
 * Cada funcao recebe array de resultados e devolve a metrica solicitada.
 * Usa numeros normais (Number) para desempenho.
 */

export interface DezenaRegistry {
  modalidade: string;
  dezenas: number[];
}

// F4: Frequencia de cada dezena no historico
export function frequenciaDezenas(registro: number[][]): Record<number, number> {
  const freq: Record<number, number> = {};

  for (const concursos of registro) {
    for (const dezena of concursos) {
      freq[dezena] = (freq[dezena] ?? 0) + 1;
    }
  }

  return freq;
}

// F5: Atraso de uma dezena (N-1 - indice da ultima aparicao; N se nunca apareceu)
export function atrasoAcumulado(registro: number[][], dezena: number): number {
  const N = registro.length;
  if (N === 0) return 0;

  let ultimoIndice = -1;
  for (let i = 0; i < N; i++) {
    const sortido = registro[i] ?? [];
    if (sortido.includes(dezena)) ultimoIndice = i;
  }

  if (ultimoIndice === -1) return N;
  return N - 1 - ultimoIndice;
}

// F6: Valor-z de uma dezena
export function valorZ(observado: number, esperado: number, desvioPadrao: number): number {
  if (desvioPadrao === 0) return 0;
  return (observado - esperado) / desvioPadrao;
}

/**
 * Log-gamma (aproximação de Lanczos, precisão ~1e-15)
 * Usado para p-valor exato do qui-quadrado via incomplete gamma
 */
function logGamma(z: number): number {
  if (z <= 0) return Number.NaN;
  // Coeficientes de Lanczos g=7
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  const zz = z - 1;
  let x = p[0];
  if (x === undefined) return Number.NaN;
  for (let i = 1; i < p.length; i++) {
    const pi = p[i];
    if (pi !== undefined) x += pi / (zz + i);
  }
  const t = zz + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (zz + 0.5) * Math.log(t) - t + Math.log(x);
}

/**
 * Incomplete gamma lower: γ(s, x) = ∫₀ˣ tˢ⁻¹ e⁻ᵗ dt
 * Série convergente para x < s+1, continuação para x ≥ s+1
 */
function lowerGamma(s: number, x: number): number {
  if (x <= 0) return 0;
  if (s <= 0) return 1;

  // Série para x < s+1
  if (x < s + 1) {
    let sum = 0;
    let term = 1;
    for (let k = 0; k < 200; k++) {
      term *= x / (s + k);
      sum += term;
      if (Math.abs(term) < 1e-15) break;
    }
    return sum * Math.exp(-x + s * Math.log(x) - logGamma(s));
  }

  // Continuação fracionária para x ≥ s+1 (Lentz's method)
  // Γ(s, x) = Γ(s) - γ(s, x), então γ(s, x) = Γ(s) - Γ(s, x)
  const gammaS = Math.exp(logGamma(s));
  let a0 = 1;
  let a1 = x;
  let b0 = 0;
  let b1 = 1;
  let c = 1;

  for (let n = 1; n < 200; n++) {
    const an = n;
    const bn = x + n - s;
    const aNext = bn * a1 + an * a0;
    const bNext = bn * b1 + an * b0;

    if (bNext !== 0) {
      const cNext = aNext / bNext;
      if (Math.abs(cNext - c) / Math.abs(cNext) < 1e-14) {
        c = cNext;
        break;
      }
      c = cNext;
    }
    a0 = a1;
    a1 = aNext;
    b0 = b1;
    b1 = bNext;
  }

  const upperGamma = Math.exp(-x + s * Math.log(x)) * c;
  return gammaS - upperGamma;
}

/**
 * p-valor exato do qui-quadrado: P(χ² > x) = 1 - γ(k/2, x/2) / Γ(k/2)
 * Substitui Wilson-Hilferty (aproximação) por cálculo exato via incomplete gamma
 */
export function pValorChiQuadradoExato(chi2: number, graus: number): number {
  if (chi2 <= 0) return 1;
  if (graus <= 0) return 0;
  const s = graus / 2;
  const x = chi2 / 2;
  const cdf = lowerGamma(s, x) / Math.exp(logGamma(s));
  return Math.max(0, Math.min(1, 1 - cdf));
}

// F7: Qui-quadrado ajustado (chi2) de uniformidade das dezenas
export function quiQuadrado(
  registros: number[][],
  universo: number,
): { chi2: number; graus: number; pValor: number } {
  const totalConcursos = registros.length;
  const dezenasPorSorteio = registros[0]?.length ?? 0;

  // Determina se as dezenas são 0-based (ex.: Lotomania) ou 1-based.
  let minObs = Number.POSITIVE_INFINITY;
  for (const sorteio of registros) {
    for (const d of sorteio) {
      if (d < minObs) minObs = d;
    }
  }
  const zeroBased = minObs === 0;
  const offset = zeroBased ? 0 : 1;

  // Contar ocorrencias
  const contagens = new Array(universo).fill(0);
  for (const sorteio of registros) {
    for (const d of sorteio) {
      if (d >= offset && d < offset + universo) contagens[d - offset]++;
    }
  }

  // Esperado sob uniformidade
  const esperado = (totalConcursos * dezenasPorSorteio) / universo;
  if (esperado === 0) return { chi2: 0, graus: universo - 1, pValor: 1 };

  // Qui-quadrado bruto
  let chi2Bruto = 0;
  for (let i = 0; i < universo; i++) {
    const diff = contagens[i] - esperado;
    chi2Bruto += (diff * diff) / esperado;
  }

  const M = universo;
  const d = dezenasPorSorteio;
  const fator = M > d ? (M - 1) / (M - d) : 1;
  const chi2 = chi2Bruto * fator;

  const graus = universo - 1;
  // USA p-VALOR EXATO (incomplete gamma) em vez de Wilson-Hilferty
  const pValor = pValorChiQuadradoExato(chi2, graus);

  return { chi2, graus, pValor };
}

// F13: Variancia amostral da soma das dezenas
export function varianciaSomaDezenas(registros: number[][], _universo: number): number {
  const somas: number[] = [];
  for (const sorteio of registros) {
    const soma = sorteio.reduce((acc, d) => acc + d, 0);
    somas.push(soma);
  }

  const n = somas.length;
  if (n <= 1) return 0;

  const media = somas.reduce((acc, s) => acc + s, 0) / n;
  const variancia = somas.reduce((acc, s) => acc + (s - media) ** 2, 0) / (n - 1);

  return variancia;
}

// Helpers de janela e distribuicoes (T3.7)
export function ultimosN<T>(registros: T[], n: number): T[] {
  if (n <= 0) return [];
  return registros.slice(Math.max(0, registros.length - n));
}

export function mediaSoma(registros: number[][]): number {
  if (registros.length === 0) return 0;
  const somas = registros.map((r) => r.reduce((a, b) => a + b, 0));
  return somas.reduce((a, b) => a + b, 0) / somas.length;
}

export function distribuicaoSomas(registros: number[][]): Record<number, number> {
  const dist: Record<number, number> = {};
  for (const r of registros) {
    const soma = r.reduce((a, b) => a + b, 0);
    dist[soma] = (dist[soma] ?? 0) + 1;
  }
  return dist;
}

// Fórmulas complementares de probabilidade (hipergeométrica) e análise descritiva
export function combinacoes(n: number, k: number): number {
  if (k < 0 || k > n || n < 0) return 0;
  if (k === 0 || k === n) return 1;
  const r = Math.min(k, n - k);
  let resultado = 1;
  for (let i = 1; i <= r; i++) {
    resultado = (resultado * (n - r + i)) / i;
  }
  return Math.round(resultado);
}

export function probabilidadeAcertos(
  universo: number,
  sorteados: number,
  apostados: number,
  acertos: number,
): number {
  if (acertos < 0 || acertos > Math.min(sorteados, apostados)) return 0;
  const favoraveis =
    combinacoes(sorteados, acertos) * combinacoes(universo - sorteados, apostados - acertos);
  const total = combinacoes(universo, apostados);
  if (total === 0) return 0;
  return favoraveis / total;
}

export function distribuicaoAcertos(
  universo: number,
  sorteados: number,
  apostados: number,
): { acertos: number; probabilidade: number }[] {
  const max = Math.min(sorteados, apostados);
  const saida: { acertos: number; probabilidade: number }[] = [];
  for (let j = 0; j <= max; j++) {
    saida.push({
      acertos: j,
      probabilidade: probabilidadeAcertos(universo, sorteados, apostados, j),
    });
  }
  return saida;
}

export function hitsEsperados(universo: number, sorteados: number, apostados: number): number {
  if (universo === 0) return 0;
  return (apostados * sorteados) / universo;
}

export function varianciaAcertos(universo: number, sorteados: number, apostados: number): number {
  if (universo <= 1) return 0;
  const p = sorteados / universo;
  return apostados * p * (1 - p) * ((universo - apostados) / (universo - 1));
}

export function desvioAcertos(universo: number, sorteados: number, apostados: number): number {
  return Math.sqrt(varianciaAcertos(universo, sorteados, apostados));
}

export function mediaSomaTeorica(universo: number, sorteados: number): number {
  return (sorteados * (universo + 1)) / 2;
}

export function varianciaSomaTeorica(universo: number, sorteados: number): number {
  if (universo <= sorteados) return 0;
  return (sorteados * (universo + 1) * (universo - sorteados)) / 12;
}

export function desvioSomaTeorica(universo: number, sorteados: number): number {
  return Math.sqrt(varianciaSomaTeorica(universo, sorteados));
}

export function gapMedioTeorico(universo: number, sorteados: number): number {
  if (sorteados <= 0) return universo;
  return (universo + 1) / (sorteados + 1);
}

export function paridadeEsperada(
  universo: number,
  sorteados: number,
): { pares: number; impares: number } {
  const paresUniverso = Math.floor(universo / 2);
  const esperadoPares = sorteados * (paresUniverso / universo);
  return { pares: esperadoPares, impares: sorteados - esperadoPares };
}

export function distribuicaoPares(registros: number[][]): { pares: number; impares: number } {
  let pares = 0;
  let impares = 0;
  for (const r of registros) {
    for (const d of r) {
      if (d % 2 === 0) pares++;
      else impares++;
    }
  }
  return { pares, impares };
}
