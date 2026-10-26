#!/usr/bin/env node
/**
 * Valida os dados JSON gerados pelo ETL.
 * Uso: npm run data:check
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MODALIDADES = ['mega-sena', 'lotofacil', 'quina', 'lotomania'] as const;

const RULES: Record<string, { min: number; max: number; drawSize: number }> = {
  'mega-sena': { min: 1, max: 60, drawSize: 6 },
  lotofacil: { min: 1, max: 25, drawSize: 15 },
  quina: { min: 1, max: 80, drawSize: 5 },
  lotomania: { min: 0, max: 99, drawSize: 20 },
};

interface Concurso {
  concurso: number;
  data: string;
  dezenas: number[];
  acumulado: boolean;
}

function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function validateModalidade(modalidade: string, jsonPath: string): string[] {
  const errors: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  } catch {
    return [`❌ ${modalidade}: JSON inválido`];
  }

  const parsed = (data ?? {}) as { concursos?: Concurso[] };
  const concursos = parsed.concursos ?? [];
  const rule = RULES[modalidade];
  if (!rule) {
    errors.push(`❌ ${modalidade}: regra desconhecida`);
    return errors;
  }

  if (concursos.length === 0) {
    errors.push(`❌ ${modalidade}: lista vazia`);
    return errors;
  }

  const concursoSet = new Set<number>();
  let prevConcurso = 0;

  for (let i = 0; i < concursos.length; i++) {
    const c = concursos[i];
    if (!c) continue;

    // concurso
    if (!Number.isInteger(c.concurso) || c.concurso <= 0) {
      errors.push(`❌ ${modalidade}: concurso inválido em ${i}`);
      continue;
    }
    if (concursoSet.has(c.concurso)) {
      errors.push(`❌ ${modalidade}: concurso ${c.concurso} duplicado`);
    }
    concursoSet.add(c.concurso);
    if (i > 0 && c.concurso <= prevConcurso) {
      errors.push(`❌ ${modalidade}: lista não está ordenada em ${i}`);
    }
    if (i > 0 && c.concurso !== prevConcurso + 1) {
      errors.push(`❌ ${modalidade}: lacuna entre concursos ${prevConcurso} e ${c.concurso}`);
    }
    prevConcurso = c.concurso;

    // data
    if (!isIsoDate(c.data)) {
      errors.push(`❌ ${modalidade}: data inválida em ${c.concurso}`);
    }

    // dezenas
    if (!Array.isArray(c.dezenas) || c.dezenas.length !== rule.drawSize) {
      errors.push(`❌ ${modalidade}: quantidade de dezenas inválida em ${c.concurso}`);
      continue;
    }
    const set = new Set<number>();
    let sorted = true;
    for (let j = 0; j < c.dezenas.length; j++) {
      const d = c.dezenas[j] as number;
      if (!Number.isInteger(d) || d < rule.min || d > rule.max) {
        errors.push(`❌ ${modalidade}: dezena inválida em ${c.concurso}`);
        break;
      }
      if (set.has(d)) {
        errors.push(`❌ ${modalidade}: dezena repetida em ${c.concurso}`);
        break;
      }
      set.add(d);
      if (j > 0 && c.dezenas[j - 1] !== undefined && d < (c.dezenas[j - 1] as number))
        sorted = false;
    }
    if (!sorted) {
      errors.push(`❌ ${modalidade}: dezenas não ordenadas em ${c.concurso}`);
    }
  }

  // F13: sanidade da soma
  const somas = concursos.map((c) => c.dezenas.reduce((a, b) => a + b, 0));
  const N = somas.length;
  if (N > 1) {
    const media = somas.reduce((a, b) => a + b, 0) / N;
    const min = rule.min;
    const max = rule.max;
    const d = rule.drawSize;
    const mediaTeorica = (d * (min + max)) / 2;
    const sigmaU2 = ((max - min + 1) ** 2 - 1) / 12;
    const variancia = (d * sigmaU2 * (max - min + 1 - d)) / (max - min + 1 - 1);
    const sigma = Math.sqrt(variancia);
    const erroPadraoMedia = sigma / Math.sqrt(N);
    if (Math.abs(media - mediaTeorica) > 4 * erroPadraoMedia) {
      errors.push(
        `❌ ${modalidade}: F13 fora do esperado (média ${media.toFixed(2)} vs ${mediaTeorica})`,
      );
    }
  }

  return errors;
}

const publicDataDir = join(process.cwd(), 'public', 'data');
const errors: string[] = [];

if (!existsSync(publicDataDir)) {
  console.error('❌ Diretório public/data/ não encontrado');
  process.exit(1);
}

for (const modalidade of MODALIDADES) {
  const jsonPath = join(publicDataDir, `${modalidade}.json`);
  if (!existsSync(jsonPath)) {
    errors.push(`❌ ${modalidade}.json não encontrado`);
    continue;
  }
  errors.push(...validateModalidade(modalidade, jsonPath));
}

if (errors.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', errors.join('\n'));
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ Todos os dados JSON válidos');
}
