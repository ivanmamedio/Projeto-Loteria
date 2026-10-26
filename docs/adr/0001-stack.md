# ADR 0001 — Stack de projeto

## Contexto

Precisamos definir a stack de desenvolvimento para o site de loteria, levando em conta:

- O site é 100% estático (não há backend, banco ou login).
- O gerador de jogos precisa rodar no navegador (sem servidor).
- Os dados históricos cabem em JSON estático.
- Queremos minimalismo, fácil manutenção e desempolga rápida.
- A equipe conhece TypeScript, mas não frameworks frontend complexos.

## Decisão

Utilizamos a pilha:

- **Astro (SSG)** para geração de páginas estáticas e SEO.
- **TypeScript puro** no navegador (sem framework UI como React/Vue/Svelte).
- **CSS puro** (variáveis + escopo do Astro) — sem Tailwind ou framework UI.
- **Biome** para lint + formatação (substitui ESLint + Prettier).
- **Vitest** para testes unitários e **Playwright** para E2E.
- Configuração do Node fixada em `engines` e `package.json` padronizado.

## Justificativa

- **Astro** gera HTML estático, ideal para SEO, com quase zero JS por padrão.
- **TypeScript puro** é suficiente para o gerador de jogos e filtros estatísticos.
- **CSS puro** é menor e mais barato de manter que uma biblioteca UI.
- **Biome** unifica lint/format e reduz dependências.

## Consequências

- O código do domínio fica em `src/domain/`, impuro apenas nas camadas `ui/` e `pages/`.
- Páginas estáticas são geradas no build (`npm run build`).
- O gerador roda no navegador a partir de JSON baixado sob demanda.
- Tudo é hospedável em qualquer provider de estático (Cloudflare Pages, GitHub Pages, Netlify).
