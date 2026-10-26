#!/usr/bin/env node
/**
 * Import dos dados do CSV → JSON estático (idempotente).
 * Referência: tasks_loteria.md — T0.1, T0.2, ADR 0002
 * Uso: npm run data:import
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const MODALIDADES = ['mega-sena', 'lotofacil', 'quina', 'lotomania'] as const;
type ModalidadeId = (typeof MODALIDADES)[number];

interface Concurso {
  concurso: number;
  data: string; // ISO YYYY-MM-DD
  dezenas: number[];
  acumulado: boolean;
}

interface DadosModalidade {
  modalidade: string;
  concursos: Concurso[];
  source: string;
  updatedAt: string;
}

function readCsv(filePath: string): string {
  const content = readFileSync(filePath, 'utf8');
  // Remover BOM se presente
  return content.replace(/^\uFEFF/, '');
}

function parseCsvRow(row: string): string[] {
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];

    if (inQuotes) {
      if (ch === '"') {
        if (row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ';') {
        rows.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  rows.push(current);
  return rows;
}

function parseDateBrasil(dateStr: string): string {
  // Converte dd/mm/aaaa para YYYY-MM-DD
  const parts = dateStr.split('/').map(Number);
  if (parts.length !== 3) return dateStr;
  const [d, m, y] = parts;
  if (d === undefined || m === undefined || y === undefined) return dateStr;
  return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
}

function toNumber(val: string): number | null {
  const cleaned = val.replace(/[^\d-]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function importModalidade(modalidade: ModalidadeId) {
  const csvPath = join(process.cwd(), 'data', 'raw', `${modalidade}.csv`);
  const jsonPath = join(process.cwd(), 'public', 'data', `${modalidade}.json`);

  if (!existsSync(csvPath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${csvPath}`);
    return;
  }

  const csv = readCsv(csvPath);
  const linhas = csv.split('\n').filter((l) => l.trim());

  if (linhas.length === 0) {
    console.warn(`⚠️  CSV vazio: ${csvPath}`);
    return;
  }

  const cabecalhos = parseCsvRow(linhas[0] ?? '');
  // Índice das colunas de interesse
  const idxConcurso = cabecalhos.findIndex((h) => h.includes('concurso'));
  const idxData = cabecalhos.findIndex((h) => h.includes('data'));
  const idxAcumulado = cabecalhos.findIndex((h) => h.includes('acumulado'));
  // Todas as colunas de dezena (dezena_1 … dezena_N)
  const idxDezenas = cabecalhos
    .map((h, i) => (h.includes('dezena') ? i : -1))
    .filter((i) => i >= 0);

  const concursos: Concurso[] = [];

  for (let i = 1; i < linhas.length; i++) {
    const cols = parseCsvRow(linhas[i] ?? '');
    if (cols.length === 0 || idxConcurso === -1 || idxData === -1 || idxDezenas.length === 0)
      continue;

    const concursoRaw = toNumber(cols[idxConcurso] ?? '');
    const dataRaw = cols[idxData] ?? '';

    if (concursoRaw === null || !dataRaw) continue;

    const dezenas = idxDezenas
      .map((idx) => toNumber(cols[idx] ?? ''))
      .filter((n): n is number => n !== null);

    const acumuladoRaw = idxAcumulado >= 0 ? (cols[idxAcumulado] ?? '').toLowerCase() : '';
    const acumulado = acumuladoRaw === 'sim' || acumuladoRaw === 'yes' || acumuladoRaw === 'true';

    concursos.push({
      concurso: concursoRaw,
      data: parseDateBrasil(dataRaw),
      dezenas,
      acumulado,
    });
  }

  // Ordenar por concurso
  concursos.sort((a, b) => a.concurso - b.concurso);

  const json: DadosModalidade = {
    modalidade,
    concursos,
    source: 'LotoAgora (derivado da CAIXA)',
    updatedAt: new Date().toISOString(),
  };

  // Garantir diretório
  mkdirSync(dirname(jsonPath), { recursive: true });

  writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  console.log(`✅ Importado ${modalidade}: ${concursos.length} concursos → ${jsonPath}`);
}

for (const modalidade of MODALIDADES) {
  importModalidade(modalidade);
}
