#!/usr/bin/env node
/**
 * Gera og-image.png (1200x630) a partir do og-image.svg
 * Uso: node scripts/generate-og-image.js
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const svgPath = join(process.cwd(), 'public', 'og-image.svg');
const pngPath = join(process.cwd(), 'public', 'og-image.png');

async function generatePng() {
  console.log('🎨 Gerando og-image.png (1200x630) a partir do SVG...');
  
  const svgBuffer = readFileSync(svgPath);
  
  await sharp(svgBuffer, { density: 300 })
    .resize(1200, 630, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  
  const stats = await sharp(pngPath).stats();
  const fs = await import('node:fs/promises');
  const { size } = await fs.stat(pngPath);
  
  console.log(`✅ PNG gerado: ${pngPath}`);
  console.log(`   Dimensões: 1200x630`);
  console.log(`   Tamanho: ${(size / 1024).toFixed(1)} KB`);
  console.log(`   Canais: ${stats.channels} (${stats.isOpaque ? 'opaco' : 'com transparência'})`);
}

generatePng().catch((err) => {
  console.error('❌ Erro ao gerar PNG:', err);
  process.exit(1);
});