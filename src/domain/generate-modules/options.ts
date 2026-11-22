/**
 * Helpers para parsing de opções da request.
 */

export function opt(opcoes: Record<string, unknown> | undefined, ...keys: string[]): unknown {
  if (!opcoes) return undefined;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(opcoes, k)) return opcoes[k];
  }
  return undefined;
}

export function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).toLowerCase());
  if (typeof v === 'string') return [v.toLowerCase()];
  if (typeof v === 'number') return [`e${v}`];
  return [];
}

export function extractConcursos(
  opcoes: Record<string, unknown> | undefined,
): number[][] | undefined {
  const raw = opt(opcoes, 'concursos', 'historico', 'dados', 'data', 'registros', 'draws', 'jogos');
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    if (Array.isArray(raw[0])) return raw as number[][];
    if (typeof raw[0] === 'object' && raw[0] !== null && 'dezenas' in (raw[0] as object)) {
      return (raw as { dezenas: number[] }[]).map((x) => x.dezenas);
    }
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.concursos)) {
      return (obj.concursos as { dezenas?: number[] }[]).map((x) => x.dezenas ?? []);
    }
    if (Array.isArray(obj.draws)) {
      return (obj.draws as { dezenas?: number[] }[]).map((x) => x.dezenas ?? []);
    }
    if (Array.isArray(obj.registros)) {
      return (obj.registros as { dezenas?: number[] }[]).map((x) => x.dezenas ?? []);
    }
  }
  return undefined;
}

export function betaFromOpcoes(opcoes: Record<string, unknown> | undefined): number {
  const intensidade = opt(opcoes, 'intensidade', 'intensity');
  const mapa: Record<string, number> = {
    suave: 0.5,
    medio: 1,
    médio: 1,
    medium: 1,
    forte: 2,
    strong: 2,
  };
  if (typeof intensidade === 'string' && mapa[intensidade.toLowerCase()] !== undefined) {
    return mapa[intensidade.toLowerCase()] as number;
  }
  const beta = opt(opcoes, 'beta', 'potencia', 'power');
  if (typeof beta === 'number' && Number.isFinite(beta)) return beta;
  if (typeof beta === 'string') {
    const n = Number(beta);
    if (Number.isFinite(n)) return n;
  }
  return 1;
}

export function fibonacciIntensidadeFromOpcoes(
  opcoes: Record<string, unknown> | undefined,
): number {
  const intensidade = opt(opcoes, 'fibonacciIntensidade', 'fibIntensity');
  if (typeof intensidade === 'number' && Number.isFinite(intensidade) && intensidade > 0) {
    return intensidade;
  }
  if (typeof intensidade === 'string') {
    const n = Number(intensidade);
    if (Number.isFinite(n) && n > 0) return n;
  }
  // Fallback para a intensidade geral (beta)
  return betaFromOpcoes(opcoes);
}
