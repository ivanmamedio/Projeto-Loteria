#!/usr/bin/env node
/**
 * Gerador de Subresource Integrity (SRI) para assets
 * Uso: node scripts/generate-sri.js
 * Gera hashes SHA-384 para assets e atualiza index.html
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

function generateSRI(filePath) {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha384').update(content).digest('base64');
  return `sha384-${hash}`;
}

function getAssetFiles(dir) {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(js|css|woff2?|png|jpg|svg|ico)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  walk(dir);
  return files;
}

function generateSRIManifest() {
  const assets = getAssetFiles(ASSETS_DIR);
  const manifest = {};
  
  for (const file of assets) {
    const relativePath = path.relative(DIST_DIR, file).replace(/\\/g, '/');
    const hash = generateSRI(file);
    manifest[relativePath] = hash;
  }
  
  return manifest;
}

function updateIndexHTML(manifest) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.warn('index.html não encontrado em dist/');
    return;
  }
  
  let html = fs.readFileSync(indexPath, 'utf-8');
  
  // Atualiza script tags com integrity
  for (const [file, hash] of Object.entries(manifest)) {
    const fileName = path.basename(file);
    const regex = new RegExp(`(<script[^>]*src=["'])[^"']*${fileName.replace(/\./g, '\\.')}(["'][^>]*>)`, 'g');
    html = html.replace(regex, `$1${file} integrity="${hash}" crossorigin="anonymous"$2`);
    
    // CSS links
    const cssRegex = new RegExp(`(<link[^>]*href=["'])[^"']*${fileName.replace(/\./g, '\\.')}(["'][^>]*>)`, 'g');
    html = html.replace(cssRegex, `$1${file} integrity="${hash}" crossorigin="anonymous"$2`);
  }
  
  fs.writeFileSync(indexPath, html);
  console.log('index.html atualizado com SRI');
}

// Main
const manifest = generateSRIManifest();

// Salva manifesto
fs.writeFileSync(
  path.join(DIST_DIR, 'sri-manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('SRI manifest gerado: dist/sri-manifest.json');

updateIndexHTML(manifest);
console.log('SRI aplicado com sucesso!');