#!/usr/bin/env node
/**
 * Download CSVs atualizados das loterias da CAIXA (via LotoAgora)
 * 
 * Uso: npm run data:download
 *      ou: node etl/download-csvs.js
 * 
 * Fontes:
 * - https://lotoagora.com.br/downloads/ (derivado da API CAIXA)
 * - API oficial: https://servicebus3.caixa.gov.br/portaldeloterias/api/
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

const BASE_URL = 'https://lotoagora.com.br/downloads/';
const FILES = [
  { name: 'mega-sena.csv', url: `${BASE_URL}mega-sena.csv` },
  { name: 'lotofacil.csv', url: `${BASE_URL}lotofacil.csv` },
  { name: 'quina.csv', url: `${BASE_URL}quina.csv` },
  { name: 'lotomania.csv', url: `${BASE_URL}lotomania.csv` },
];

const OUT_DIR = join(process.cwd(), 'data', 'raw');
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const TIMEOUT_MS = 30000;

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 LoteriaDataUpdater/1.0';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempt = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/csv,text/plain,*/*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (attempt >= MAX_RETRIES) throw error;
    console.warn(`  ⚠ Tentativa ${attempt}/${MAX_RETRIES} falhou: ${error.message}. Retentando em ${RETRY_DELAY_MS}ms...`);
    await sleep(RETRY_DELAY_MS * attempt);
    return fetchWithRetry(url, attempt + 1);
  }
}

function validateCSV(content, expectedName) {
  if (!content || content.trim().length === 0) {
    return { valid: false, lines: 0, message: 'Arquivo vazio' };
  }

  // Remover BOM se presente
  const cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return { valid: false, lines: lines.length, message: 'Menos de 2 linhas (cabeçalho + dados)' };
  }

  // Verificar cabeçalho esperado
  const header = lines[0].toLowerCase();
  if (!header.includes('concurso') || !header.includes('data')) {
    return { valid: false, lines: lines.length, message: 'Cabeçalho não contém "concurso" e "data"' };
  }

  // Verificar delimitador (;)
  if (!header.includes(';')) {
    return { valid: false, lines: lines.length, message: 'Delimitador ";" não encontrado no cabeçalho' };
  }

  return { valid: true, lines: lines.length - 1, message: 'OK' };
}

async function downloadFile(file) {
  console.log(`\n📥 Baixando ${file.name}...`);
  
  try {
    const response = await fetchWithRetry(file.url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Decodificar UTF-8 com BOM
    let content = buffer.toString('utf8');
    
    const validation = validateCSV(content, file.name);
    
    if (!validation.valid) {
      return { success: false, message: `Validação falhou: ${validation.message}` };
    }

    const outPath = join(OUT_DIR, file.name);
    writeFileSync(outPath, content, 'utf8');
    
    return { 
      success: true, 
      message: `Salvo: ${outPath} (${validation.lines} concursos)` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Erro: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Atualizador de Dados das Loterias (CAIXA/LotoAgora)     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n📁 Diretório de saída: ${OUT_DIR}`);
  console.log(`🌐 Fonte: ${BASE_URL}`);

  // Criar diretório se não existe
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
    console.log('📂 Diretório criado');
  }

  // Mostrar arquivos atuais
  const existing = readdirSync(OUT_DIR).filter((f) => f.endsWith('.csv'));
  if (existing.length > 0) {
    console.log('\n📋 Arquivos atuais:');
    for (const f of existing) {
      const stats = statSync(join(OUT_DIR, f));
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   ${f} (${sizeKB} KB, modificado: ${stats.mtime.toLocaleDateString('pt-BR')})`);
    }
  }

  // Perguntar confirmação
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question('\n❓ Continuar com download? (s/N): ', resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'sim') {
    console.log('❌ Cancelado pelo usuário');
    process.exit(0);
  }

  console.log('\n🚀 Iniciando downloads...\n');

  const results = [];
  for (const file of FILES) {
    const result = await downloadFile(file);
    results.push({ file: file.name, ...result });
    
    if (result.success) {
      console.log(`  ✅ ${result.message}`);
    } else {
      console.log(`  ❌ ${result.message}`);
    }
  }

  // Resumo
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('📊 RESUMO');
  console.log('══════════════════════════════════════════════════════════');
  
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  for (const r of results) {
    const icon = r.success ? '✅' : '❌';
    console.log(`  ${icon} ${r.file}: ${r.message}`);
  }

  console.log(`\n✅ Sucesso: ${successful.length}/${FILES.length}`);
  if (failed.length > 0) {
    console.log(`❌ Falhas: ${failed.length}`);
    process.exit(1);
  }

  console.log('\n📝 Próximos passos:');
  console.log('   1. Verificar diff: git diff data/raw/');
  console.log('   2. Processar ETL: npm run data:import');
  console.log('   3. Validar: npm run data:check');
  console.log('   4. Commit + deploy');
}

main().catch((error) => {
  console.error('\n💥 Erro fatal:', error);
  process.exit(1);
});