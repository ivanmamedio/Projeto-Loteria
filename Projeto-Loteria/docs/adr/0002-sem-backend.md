# ADR 0002 — Sem backend / banco / API

## Contexto

Precisamos decidir como o site vai armazenar e servir os dados históricos de loteria.

Alternativas avaliadas:

- **Backend + API + banco**: excessivo, custo, infraestrutura, LGPD.
- **JSON estático no Git**: simples, revisável, sem servidor, backup = Git.
- **Rasterização (imagem)**: ruim para acessibilidade e SEO.

## Decisão

Tudo é **JSON estático**, gerado a partir de CSVs oficiais da CAIXA:

- Dados brutos em `data/raw/<modalidade>.csv`
- Dados normalizados em `public/data/<modalidade>.json` (commitados no Git)
- Atualização manual e deliberada: baixar CSV → `npm run data:import` → revisar diff → commit

## Justificativa

- Os dados (Mega-Sena, Lotofácil, Quina, Lotomania) cabem em JSON estático.
- Menor superfície de ataque (sem API exposta).
- Custoゼロ (zero).
- Dados são imutáveis no Markdown/JSON, facilitando auditoria e reprodutibilidade.

## Consequências

- O ETL roda no Node (nunca no navegador).
- O navegador faz `fetch` lazy de `public/data/*.json` ao escolher uma modalidade.
- Não há banco nem servidor: apenas arquivos estáticos.
- Backup = repositório Git remoto; restauração = checkout + import.
