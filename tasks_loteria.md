# tasks_loteria.md — Plano de execução

> Derivado do `Prompt_Mestre_Site_Loteria.md`. Este arquivo **traduz o prompt mestre em tarefas executáveis** e acrescenta o que faltava: importação dos CSVs oficiais, filtros por mais sorteados, fórmulas de montagem de jogos e a página que explica tudo isso.
>
> **Princípio acima de todos:** em sorteio justo, toda combinação válida tem a mesma probabilidade. As fórmulas deste documento servem para **descrever o histórico, organizar e diversificar jogos** — nunca para prometer vantagem. Essa honestidade faz parte do produto.

## Como usar este arquivo

- Execute as fases em ordem. Cada tarefa tem ID, estimativa (h), dependências e **critério de aceite**. Só marque `[x]` com evidência (teste passando, arquivo existente, commit).
- Prioridades: **P0** = MVP · **P1** = logo após o MVP · **P2** = opcional.
- Estimativas são hipóteses de trabalho de uma pessoa, sem contar espera jurídica, aprovação de fornecedores ou revisão externa.
- Uma tarefa por commit (ou PR pequeno). Se a tarefa passar de 4 h, divida.

---

## 1. Decisões de arquitetura (resumo)

**Site 100% estático. Sem backend, sem banco, sem login, sem cron.**

| Necessidade | Solução | Por que é a mais simples |
|---|---|---|
| Páginas indexáveis (SEO) | **Astro** (SSG) | HTML pronto, quase zero JS por padrão |
| Gerador de jogos | **TypeScript puro** no navegador | Sem servidor → sem rate limit, sem CAPTCHA, sem custo variável |
| Dados históricos | **CSV baixado → script Node → JSON estático** commitado | Sem banco; diffs revisáveis no Git; backup = Git |
| Estatísticas | Funções puras em `src/domain/`, rodando no build (páginas estáticas) **e** no navegador (filtros interativos) | Um único código, testado uma vez |
| Estilo | CSS puro (variáveis + escopo do Astro) | Sem Tailwind, sem build extra |
| Interatividade | `<script>` do Astro com TS puro | Sem React/Svelte/Vue |
| Lint + formatação | **Biome** (uma ferramenta) | Substitui ESLint + Prettier |
| Testes | **Vitest** (unidade) + **Playwright** (2–3 fluxos E2E, com axe) | Cobrem os riscos reais |
| Hospedagem | Hospedagem estática gratuita (ex.: Cloudflare Pages, GitHub Pages ou Netlify) — **confirmar limites atuais na T0.6** | Sem servidor para manter |
| Analytics | **Nenhum no MVP** | Menos LGPD, menos scripts, menos peso |

**Dependências totais previstas (~8):**
- runtime: `astro`, `@astrojs/sitemap`
- dev: `typescript`, `@biomejs/biome`, `vitest`, `papaparse` (+ tipos; só no ETL), `@playwright/test`, `@axe-core/playwright`
- Regra: **nova dependência exige ADR curta** em `docs/adr/` justificando por que 20 linhas próprias não bastam.

**Por que o gerador roda no navegador:** a validação "no servidor" do prompt mestre só faz sentido se existir API. Aqui não existe; a validação fica em `parseRequest()` (função pura, testada) e é a **única** porta de entrada do domínio — tanto a UI quanto os testes passam por ela.

---

## 2. Estrutura do repositório

```
loteria/
├─ .github/workflows/ci.yml
├─ data/
│  ├─ raw/                 # CSVs baixados (gitignored até T0.2 confirmar os termos)
│  └─ samples/             # poucas linhas reais por modalidade, para testes
├─ docs/
│  ├─ adr/                 # decisões curtas: 0001-stack.md, 0002-sem-backend.md ...
│  ├─ dados.md             # formato real dos CSVs, como atualizar, histórico de incidentes
│  ├─ metodologia.md       # FONTE ÚNICA das fórmulas F1–F13 (a página "Como funciona" deriva daqui)
│  └─ fontes.md            # fontes consultadas: URL, data, o que confirma
├─ etl/                    # roda só no Node; nunca vai para o navegador
│  ├─ parse-csv.ts         # encoding, delimitador, mapeamento de cabeçalhos
│  ├─ normalize.ts         # data dd/mm/aaaa → ISO, dezenas → number[], ordenação
│  ├─ validate.ts          # regras de integridade (seção 4.3)
│  ├─ import.ts            # CLI: data/raw → public/data (idempotente)
│  └─ check.ts             # CLI: valida os JSON commitados (roda no CI)
├─ public/
│  ├─ data/                # mega-sena.json, lotofacil.json, quina.json, lotomania.json
│  ├─ _headers             # CSP e demais cabeçalhos (formato depende da hospedagem)
│  ├─ robots.txt
│  └─ favicon.svg
├─ src/
│  ├─ domain/              # TS PURO: sem DOM, sem Astro, sem fetch. Testado a fundo.
│  │  ├─ types.ts          # ModalityId, Rules, Draw, GameRequest, Game, Result
│  │  ├─ rules.ts          # ÚNICA tabela de regras das modalidades
│  │  ├─ rng.ts            # mulberry32 + newSeed()
│  │  ├─ probability.ts    # F1–F3 (BigInt)
│  │  ├─ stats.ts          # F4–F7, F13 (frequência, atraso, z, χ², soma, paridade)
│  │  ├─ sampling.ts       # F10 (amostragem ponderada sem reposição)
│  │  ├─ weights.ts        # F8, F9
│  │  ├─ filters.ts        # F11 (faixas teóricas + rejeição)
│  │  ├─ diversify.ts      # F12
│  │  ├─ generate.ts       # fachada: parseRequest() e generateGames()
│  │  ├─ describe.ts       # resumo educativo de cada jogo
│  │  └─ version.ts        # ALGORITHM_VERSION + changelog
│  ├─ ui/                  # código do navegador (usa domain/)
│  │  ├─ generator.ts      # liga formulário ↔ domínio ↔ DOM
│  │  ├─ history.ts        # localStorage versionado
│  │  ├─ share.ts          # copiar, imprimir, WhatsApp
│  │  ├─ load-data.ts      # fetch lazy do JSON + checagem de schemaVersion
│  │  └─ format.ts         # Intl pt-BR, pad2
│  ├─ components/          # .astro: Disclaimer, NumberBall, ModalityPicker, StatsTable...
│  ├─ layouts/Base.astro
│  ├─ content/             # Markdown editorial (content collections nativas do Astro)
│  ├─ pages/
│  │  ├─ index.astro                 # gerador
│  │  ├─ como-funciona.astro         # fórmulas e métodos (seção 6)
│  │  ├─ estatisticas/[modalidade].astro
│  │  ├─ probabilidade.astro
│  │  ├─ dados.astro                 # origem e atualização dos dados
│  │  ├─ faq.astro · sobre.astro · contato.astro
│  │  ├─ privacidade.astro · termos.astro
│  │  └─ 404.astro
│  └─ styles/global.css
├─ e2e/                    # Playwright
├─ .env.example            # só SITE_URL; sem segredos
├─ astro.config.mjs · biome.json · tsconfig.json · package.json · README.md
```

**Testes unitários ficam ao lado do código** (`stats.ts` → `stats.test.ts`).

**Regra de dependência (imposta em revisão):**
`domain` não importa nada de fora → `etl` e `ui` importam `domain` → `pages/components` importam `ui` e `domain`. Nunca o contrário. `etl/` nunca é importado por `src/`.

---

## 3. Regras de arquitetura e código limpo

**Estrutura e design**
1. **Funções puras no domínio.** Mesma entrada → mesma saída. Aleatoriedade entra como parâmetro `rng: () => number`; nunca `Math.random()` solto.
2. **Uma única tabela de regras** (`rules.ts`). Nenhum `60`, `6` ou `25` hardcoded fora dela. Páginas de modalidade são **geradas a partir dela** → impossível a página dizer uma coisa e o gerador outra.
3. **Um único caminho de geração** para todas as estratégias: "aleatório" é a amostragem ponderada com pesos todos iguais a 1. Menos ramificações = menos bugs.
4. **Parse, don't validate:** `parseRequest(input: unknown): Result<GameRequest, string[]>` — depois dele os tipos já são confiáveis. Mensagens de erro em português e acionáveis.
5. **Sem abstrações antecipadas.** Sem classes, factories, injeção de dependência, "services", "managers". Módulos de funções bastam. Extraia só na terceira repetição.
6. **Erros são valores** no domínio (`Result`), exceções só para bugs. Nunca `catch {}` vazio.

**TypeScript**
7. `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. Proibido `any`; `unknown` + estreitamento.
8. Tipos literais para IDs (`'mega-sena' | 'lotofacil' | ...`); `as const` em tabelas; `readonly` em arrays de dados.

**Legibilidade**
9. Funções ≤ 30 linhas; arquivos ≤ 200 linhas; ≤ 3 parâmetros (senão, objeto).
10. Nomes em inglês no código (`frequencies`, `delays`), textos de interface e docs em português. Dezenas são `number`; **só formatam com `pad2` na saída**.
11. Comentário explica **por quê** (e cita a fórmula `F10`), não o quê. Cada fórmula tem ID e vive em `docs/metodologia.md`.
12. Sem código morto, sem `TODO` sem tarefa associada, sem flags não usadas.

**Armadilhas conhecidas (cada uma vira teste)**
- **Datas:** nunca `new Date('2026-10-23')` (fuso desloca o dia). Guarde `YYYY-MM-DD` como string; só formate para exibir.
- **Lotomania usa 00–99.** O zero é dezena válida; `if (!n)` quebra. Índice de dezena = `n - rules.min`.
- **Números do CSV vêm em formato brasileiro** (ex.: `"1.234,56"`) nas colunas de prêmio — ignoramos essas colunas, mas o parser não pode quebrar com elas.
- **Viés de módulo:** não use `rand % n`. A amostragem usa float em [0,1) (F10), sem viés.
- **`localStorage` pode falhar** (modo privado, cota). Sempre `try/catch`, versão de schema, limite de 50 jogos, e tratar o conteúdo como **não confiável** (renderizar com `textContent`, nunca `innerHTML`).
- **WhatsApp:** `https://wa.me/?text=${encodeURIComponent(texto)}`.

**Git e CI**
13. Commits pequenos e imperativos (`feat(domain): add weighted sampling`). Branch `main` protegida; CI obrigatório.
14. CI (`.github/workflows/ci.yml`): `npm ci` → `npm run check` (Biome + `astro check` + Vitest) → `npm run data:check` → `npm run build`. E2E em job separado.
15. `package.json`: `dev`, `build`, `preview`, `check`, `test`, `data:import`, `data:check`, `e2e`. Node fixado em `engines`.

**Orçamentos (medir, não prometer)**
- JS da página inicial: **≤ 30 KB gzip** (sem contar os dados). JSON de uma modalidade só é baixado quando ela é escolhida e/ou uma estratégia estatística é usada.
- Zero fontes web externas: usar pilha de fontes do sistema (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`). Sem requisição externa, sem licença a rastrear.

---

## 4. Dados: do CSV da CAIXA ao site

### 4.1 Fluxo

```
CSV baixado ──► data/raw/<modalidade>.csv
                    │  npm run data:import
                    ▼
          etl/parse-csv → normalize → validate → merge
                    │
                    ▼
        public/data/<modalidade>.json   (commitado, determinístico)
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
 build (páginas de        navegador (fetch lazy →
 estatísticas estáticas)   filtros e estratégias)
```

**Atualização é manual e deliberada:** baixar CSV novo → `npm run data:import` → revisar o `git diff` do JSON → commit → deploy. Automatizar só quando houver fonte estável e permitida (P2).

> **Atenção (T0.1):** confirme com o arquivo real que você baixou: extensão (a CAIXA costuma oferecer planilha Excel; se for `.xlsx`, abra e use *Salvar como → CSV UTF-8*), delimitador, codificação e nomes de colunas. O parser abaixo foi desenhado para ser **tolerante**, mas o formato real manda.

### 4.2 Formato do JSON gerado (compacto)

```json
{
  "schemaVersion": 1,
  "modality": "mega-sena",
  "parserVersion": "1.0.0",
  "sourceNote": "Resultados oficiais da CAIXA; arquivo baixado em AAAA-MM-DD",
  "contentHash": "sha256 do campo draws",
  "importedAt": "2026-10-23T12:00:00Z",
  "count": 2900,
  "lastContest": 2900,
  "lastDate": "2026-10-21",
  "draws": [[1, "1996-03-11", 4, 5, 30, 33, 41, 52]]
}
```

Cada sorteio é `[concurso, "AAAA-MM-DD", ...dezenas em ordem crescente]`. Só guardamos o que usamos: concurso, data e dezenas (ignoramos ganhadores, rateio, cidades etc.).

### 4.3 Regras do `parse-csv` e `validate`

**Parse (tolerante)**
- Remover BOM; tentar UTF-8, cair para Latin-1 se houver caracteres inválidos.
- Detectar delimitador (`;` ou `,`) pela primeira linha.
- Mapear cabeçalhos por **nome normalizado** (minúsculo, sem acento, sem espaços extras), nunca por posição: `concurso`, `data sorteio`/`data do sorteio`, `bola1…bolaN` (aceitar também `1ª dezena…`). Colunas desconhecidas são ignoradas.
- Linhas sem número de concurso (ex.: continuações com cidades de ganhadores, se o seu arquivo as tiver) são **ignoradas**, não tratadas como erro — mas contadas no relatório.

**Validação (qualquer falha = aborta, não grava JSON parcial)**
1. Todos os cabeçalhos obrigatórios presentes (senão: "formato mudou" com a lista do que faltou).
2. `drawSize` dezenas por linha, inteiras, **dentro de `[min, max]`**, **sem repetição**.
3. Concurso inteiro positivo, **sem duplicatas**, sequência **contígua** (lacuna = erro com os números faltantes).
4. Datas válidas, formato `dd/mm/aaaa`, **não decrescentes** com o número do concurso, não no futuro.
5. **Sanidade estatística (F13):** a média histórica da soma das dezenas deve estar a no máximo 4 erros-padrão da média teórica. Isso pega bugs de parser (coluna trocada, dezena lida errada) que passariam nas outras checagens.
6. Mesmo concurso já existente no JSON com **dezenas diferentes** → erro de conflito (nunca sobrescreve em silêncio; exige `--force` explícito).

**Idempotência:** mesma entrada ⇒ JSON **idêntico byte a byte**. `importedAt` só muda se `contentHash` mudar.

**Relatório do import** (stdout): concursos lidos / novos / ignorados / conflitos, último concurso e data, tempo. Sem dados pessoais (não há).

---

## 5. Metodologia: filtros, métricas e equações

> Notação: **M** = quantidade de dezenas no universo (Mega: 60) · **d** = dezenas sorteadas (Mega: 6) · **n** = dezenas na aposta · **N** = concursos na janela analisada · **p = d/M** · **fᵢ** = frequência da dezena i na janela · **aᵢ** = atraso da dezena i.
> Cada fórmula tem ID (F1…F13), vive em `docs/metodologia.md`, aparece na página "Como funciona" e tem **pelo menos um teste com exemplo calculado à mão**.

### 5.1 Probabilidade (iguala todo mundo)

| ID | Fórmula | Uso |
|---|---|---|
| **F1** | `C(M,d) = M! / (d!·(M−d)!)` | Total de combinações |
| **F2** | `P(sua combinação) = 1 / C(M,d)`; com **m jogos distintos**: `m / C(M,d)` | Única forma real de aumentar a chance: **mais combinações distintas**, com o custo correspondente |
| **F3** | `P(X=h) = C(n,h)·C(M−n, d−h) / C(M,d)` (hipergeométrica) | Chance de h acertos com aposta de n dezenas |

Valores de conferência (devem estar nos testes; confirmar contra as tabelas oficiais da CAIXA):
`C(60,6)=50.063.860` · `C(25,15)=3.268.760` · `C(80,5)=24.040.016` · Mega com 7 dezenas: `1 em 7.151.980` · Lotomania, 20 acertos com 50 dezenas: `≈ 1 em 11.372.635`.

### 5.2 Métricas descritivas (sobre o histórico, janela configurável)

| ID | Fórmula | Leitura |
|---|---|---|
| **F4** | `fᵢ` = nº de concursos da janela que contêm i; esperado `E = N·d/M` | Quantas vezes saiu vs. quanto seria "esperado" |
| **F5** | `aᵢ = (N−1) − índice da última aparição na janela`; se não apareceu, `aᵢ = N` | Quantos concursos faz que não sai ("atraso" descritivo) |
| **F6** | `zᵢ = (fᵢ − E) / √(N·p·(1−p))` — exato: `fᵢ ~ Binomial(N, p)` | Quão longe do esperado, em desvios-padrão |
| **F7** | `X² = Σ (fᵢ−E)²/E` ; **`χ²_aj = X²·(M−1)/(M−d)`**, `gl = M−1` ; p-valor ≈ `1 − Φ(w)`, `w = ((χ²_aj/gl)^(1/3) − (1 − 2/(9·gl))) / √(2/(9·gl))` (Wilson–Hilferty) | Teste de uniformidade do histórico |
| **F13** | Soma `S` do sorteio: média teórica `E[S] = d·(min+max)/2`; variância `Var[S] = d·σᵤ²·(M−d)/(M−1)`, `σᵤ² = (M²−1)/12`. Empírica: `μ = ΣSₜ/N`, `σ = √(Σ(Sₜ−μ)²/(N−1))` | Compara a soma histórica com a teórica; também valida o ETL |

**Notas importantes (vão para a página):**
- O fator `(M−1)/(M−d)` em F7 existe porque as dezenas de um mesmo sorteio saem **sem reposição** (covariância negativa entre contagens); sem ele o teste fica enviesado. **Teste obrigatório:** simular 10.000 históricos uniformes (seed fixa) e verificar que ≈5% dos p-valores ficam abaixo de 0,05 (tolerância definida no teste).
- Em F6, com M = 60 dezenas, mesmo num sorteio perfeitamente justo há **~94%** de chance (aprox., assumindo independência) de pelo menos uma dezena ter |z| > 2. "Dezena fora do normal" é o esperado, não sinal de padrão.
- Valores de conferência de F13: Mega `E[S]=183` (σ≈40,6) · Lotofácil `195` (σ≈18,0) · Quina `202,5` · Lotomania `990`.
- Mostrar sempre: **janela, N, data da última atualização e esta frase:** "Frequência passada não altera a probabilidade do próximo sorteio."

Também exibir (sem fórmula nova): distribuição de pares/ímpares do histórico vs. a teórica (F3 aplicada ao universo), distribuição por dezenas (01–10, 11–20…) e histograma da soma.

**Filtro de período (o que você pediu — "filtrar os números mais sorteados"):**
janelas `todos · últimos 200 · 100 · 50 · 20 · 10` e ordenação por `frequência ↓`, `atraso ↓`, `|z| ↓` ou `dezena ↑`; tabela das **Top 10 / Top 15 mais sorteadas** no período. Mesma função (`stats.ts`) no build e no navegador.

### 5.3 Estratégias de montagem (selecionáveis no gerador)

Todas usam **a mesma amostragem ponderada (F10)**; só mudam os pesos.

| ID | Estratégia | Pesos | Observação honesta |
|---|---|---|---|
| **E0** | **Aleatório uniforme** (padrão) | `wᵢ = 1` | Referência. Não precisa de dados históricos |
| **E1** | **Mais frequentes** | **F8:** `wᵢ = ((fᵢ+1)/(f̄+1))^β` | `β=0` volta ao uniforme. Presets: Suave 0,5 · Médio 1 · Forte 2 |
| **E2** | **Mais atrasadas** | **F9:** `wᵢ = ((aᵢ+1)/(ā+1))^β` | Mesma ideia, com atraso. Não existe "dívida" estatística: dezena atrasada não é "devida" |
| **E3** | **Equilibrado** (filtros, **combinável** com E0/E1/E2) | F11 | Restringe o formato do jogo; não muda a chance |
| **E4** | **Diversificar o lote** (combinável) | F12 | Evita jogos muito parecidos entre si dentro do mesmo lote |

**F10 — Amostragem ponderada sem reposição (Efraimidis–Spirakis):** para cada dezena sorteie `uᵢ ~ U(0,1)`, calcule a chave `kᵢ = ln(uᵢ)/wᵢ` e escolha as **n maiores chaves**. Com pesos iguais é uniforme; com pesos maiores, a dezena tem mais chance de entrar — sem viés de módulo e sem laço de rejeição.

**F11 — Filtros de equilíbrio (por rejeição).** Gera-se o jogo (F10) e **aceita-se somente se** passar em todos os filtros ativos; senão sorteia de novo (máx. 10.000 tentativas; a taxa de aceitação é exibida; se for muito baixa, mensagem clara: "restrições rígidas demais, afrouxe algum filtro"). Os intervalos são **teóricos, calculados do universo — não do histórico** (menos dependência de dados, funciona para qualquer tamanho de aposta, inclusive Lotomania com 50):
- **Pares:** intervalo central ≥ 80% da distribuição hipergeométrica: `lo = min h com CDF(h) > 0,10`; `hi = max h com 1−CDF(h−1) > 0,10`.
- **Soma:** `E[S] ± 1,2816·σ` (F13 com `d` trocado por `n`), arredondando para fora.
- **Máx. por dezena (01–10, 11–20…):** não mais que `⌈n / nº de faixas⌉ + 1`.
- **Sequência máxima:** valor por modalidade **calibrado por simulação** (percentil 90 da maior sequência de números consecutivos sob sorteio uniforme, seed fixa) e gravado em `rules.ts` com comentário (T4.7). Opção oferecida só onde fizer sentido.
- **Evitar padrão de calendário (P2, desligado por padrão, só modalidades com dezenas > 31):** exigir ao menos ⅓ das dezenas acima de 31. É **heurística de diversificação** (menos gente aposta nessas combinações; se houver prêmio, tende a dividir menos), **sem efeito na chance de ganhar** e sem dados públicos de popularidade para comprovar. Dizer isso na página.

**F12 — Diversificação do lote (guloso, min-max de sobreposição):** gerar um conjunto de candidatos `K = max(30, 20·jogos)` com a estratégia escolhida; escolher o primeiro; cada próximo é o candidato que **minimiza a maior interseção** `|c ∩ s|` com os já escolhidos (desempate: menor soma de interseções). Observação: em Lotofácil (15 de 25) a interseção mínima entre dois jogos já é 5; o método apenas minimiza o excesso.

### 5.4 Resumo educativo de cada jogo (`describe.ts`)

Exemplo de saída (sem alegação de vantagem):
> "Jogo gerado por **Mais frequentes (β=1)** na janela dos últimos 100 concursos. Contém 3 dezenas entre as 10 mais sorteadas do período · 4 pares / 2 ímpares · soma 171 (faixa teórica central: 143–223) · maior sequência: 2. **Isto descreve o jogo; não altera sua probabilidade.**"

### 5.5 Reprodutibilidade e transparência

- PRNG documentado: **mulberry32** com seed de 32 bits vinda de `crypto.getRandomValues`. O **código do lote** (seed em hexadecimal) aparece no resultado e é salvo no histórico; mesmo código + mesmas opções + mesma versão ⇒ mesmos jogos.
- `ALGORITHM_VERSION` (`src/domain/version.ts`) aparece em cada lote; mudanças de método vão para o changelog público.
- Para entretenimento, mulberry32 é suficiente; **não** é para fins de segurança, e a página diz isso.

### 5.6 Trechos de referência (guia de implementação)

```ts
// src/domain/rng.ts
export type Rng = () => number; // [0, 1)
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const newSeed = (): number => crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
```

```ts
// src/domain/sampling.ts — F10 (pool: dezenas; weights: mesmo índice; todos > 0)
export function sampleWeighted(pool: readonly number[], weights: readonly number[], k: number, rng: Rng): number[] {
  return pool
    .map((n, i) => ({ n, key: Math.log(rng() || Number.MIN_VALUE) / (weights[i] ?? 1) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, k)
    .map((x) => x.n)
    .sort((a, b) => a - b);
}
```

```ts
// src/domain/weights.ts — F8 (F9 é idêntica trocando frequência por atraso)
export function frequencyWeights(f: readonly number[], beta: number): number[] {
  const mean = f.reduce((s, x) => s + x, 0) / f.length;
  return f.map((x) => ((x + 1) / (mean + 1)) ** beta);
}
```

```ts
// src/domain/probability.ts — F1 e F3 com BigInt (C(100,50) estoura Number)
export function comb(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  const kk = Math.min(k, n - k);
  let r = 1n;
  for (let i = 1; i <= kk; i++) r = (r * BigInt(n - kk + i)) / BigInt(i);
  return r;
}
/** "1 em X", arredondado para baixo. */
export function oneIn(M: number, d: number, n: number, h: number): bigint {
  const ways = comb(n, h) * comb(M - n, d - h);
  return ways === 0n ? 0n : comb(M, d) / ways;
}
```

```ts
// src/domain/rules.ts — ÚNICA fonte das regras (CONFIRMAR na T0.3 com as regras oficiais vigentes)
export const RULES = {
  'mega-sena': { name: 'Mega-Sena', min: 1, max: 60, drawSize: 6,  bet: { min: 6,  max: 20, default: 6 } },
  lotofacil:   { name: 'Lotofácil', min: 1, max: 25, drawSize: 15, bet: { min: 15, max: 20, default: 15 } },
  quina:       { name: 'Quina',     min: 1, max: 80, drawSize: 5,  bet: { min: 5,  max: 15, default: 5 } },
  lotomania:   { name: 'Lotomania', min: 0, max: 99, drawSize: 20, bet: { min: 50, max: 50, default: 50 } },
} as const;
```

---

## 6. Página "Como funciona a escolha dos jogos?" (`/como-funciona`)

Link fixo no cabeçalho e abaixo do botão "Gerar combinações". Conteúdo derivado de `docs/metodologia.md`; **valores numéricos vêm de `rules.ts` e `probability.ts`, nunca digitados à mão**.

**Estrutura da página**
1. **Em uma frase:** "Nenhum método aumenta a chance de ganhar; aqui você escolhe *como* montar seus jogos, não *se* vai ganhar." + aviso padrão (`<Disclaimer />`).
2. **O que é igual para todos:** F1–F3 com a tabela das 4 modalidades (combinações, "1 em X"); exemplo: "m jogos distintos = m/C(M,d)".
3. **De onde vêm os dados:** fonte, janela, **concurso e data da última atualização** (injetados no build), link para `/dados`.
4. **O que medimos no histórico:** F4–F7 e F13, cada uma com **exemplo numérico resolvido** e um gráfico/tabela simples.
5. **Por que "mais sorteados" não prevê nada:** o argumento do z-score e dos ~94% (seção 5.2) + resultado real do teste de uniformidade (F7) com os dados atuais.
6. **Como cada método monta o jogo:** E0–E4 em cartões iguais, cada um com **"O que faz"** e **"O que NÃO faz"**, fórmula (F8–F12) e um mini-exemplo.
7. **Filtros de equilíbrio:** F11, explicando a taxa de aceitação e por que os intervalos são teóricos.
8. **Diversificar o lote:** F12 com exemplo de 3 jogos.
9. **Reprodutibilidade:** código do lote, versão do algoritmo, PRNG usado.
10. **Limitações e responsabilidade:** entretenimento/estudo; sem vínculo com a CAIXA; jogue com responsabilidade; público adulto.
11. **Changelog do algoritmo.**

**Formato das fórmulas:** texto/`<code>` com símbolos Unicode (ex.: `wᵢ = ((fᵢ+1)/(f̄+1))^β`). Sem biblioteca de matemática (KaTeX). MathML nativo é possível depois (P2).

**Critérios de aceite da página:** (a) toda fórmula F1–F13 aparece com exemplo; (b) cada número exibido é calculado, não digitado; (c) nenhum texto sugere vantagem (revisão por checklist de palavras proibidas: "garantido", "infalível", "quente", "chance maior"); (d) navegável por teclado, contraste AA; (e) passa no axe.

---

## 7. Backlog por fase

### Fase 0 — Descoberta e decisões · ≈ 8 h

- [x] **T0.1 (P0, 2 h) CSVs reais.** Baixar o histórico das 4 modalidades para `data/raw/`; documentar em `docs/dados.md` extensão, delimitador, encoding, cabeçalhos exatos, primeira/última linha e linhas "extras"; extrair 5–10 linhas por modalidade para `data/samples/`. **Aceite:** `docs/dados.md` descreve o formato real; amostras versionadas. **Concluído:** CSVs baixados de https://lotoagora.com.br/downloads/ (derivado da CAIXA) em 2026-10-23; docs/dados.md e data/samples/ criados.
- [x] **T0.2 (P0, 1 h) Termos de uso dos dados.** Pesquisar na fonte oficial; decidir se `data/raw/` entra no Git e se o JSON derivado (apenas concurso/data/dezenas) pode ser publicado. Registrar em `docs/fontes.md` (URL, data, conclusão). Dúvida real → advogado. **Aceite:** decisão escrita. **Concluído:** Baixei os 4 CSVs (LotoAgora v1.0, derivado da API CAIXA), configurei `docs/fontes.md` e decidir que `data/raw/` entra no Git com aviso de origem pública e não ofical.
- [x] **T0.3 (P0, 1 h) Regras oficiais.** Confirmar universo, dezenas sorteadas e limites de aposta das 4 modalidades; ajustar `rules.ts`. **Aceite:** tabela com fonte e data. **Concluído:** `src/domain/rules.ts` criado com as regras oficiais da CAIXA (2026-10-23); tabela abaixo.

## T0.3 — Regras oficiais das 4 modalidades

**Fonte:** Portal Loterias da CAIXA — páginas "Como jogar"/"Apostas" de cada modalidade, consultadas em 2026-10-23.

| Modalidade | Universo de dezenas | Dezenas sorteadas | Faixa de dezenas por aposta | Preço mínimo da aposta | Teimosinha (concursos consecutivos) |
|---|---|---|---|---|---|
| Mega-Sena | 60 (1–60) | 6 | 6 a 20 | R$ 6,00 (6 dezenas) | 2, 3, 4, 6, 8, 9, 12 |
| Lotofácil | 25 (1–25) | 15 | 15 a 20 | R$ 3,50 (15 dezenas) | 2, 3, 4, 6, 8, 9, 12, 18, 24 |
| Quina | 80 (1–80) | 5 | 5 a 15 | R$ 3,00 (5 dezenas) | 3, 6, 12, 18, 24 |
| Lotomania | 100 (0–99) | 20 | 50 fixo | R$ 3,00 (único preço) | 2, 3, 4, 6, 8, 9, 12 |
- [ ] **T0.4 (P1, 1 h) Nome, domínio e marca.** Escolher nome sem "CAIXA/oficial/garantido"; verificar registro de domínio e INPI **sem presumir disponibilidade**.
- [ ] **T0.5 (P1, 1 h) Política do AdSense para loteria.** Pesquisar política vigente; **decisão recomendada:** não monetizar no MVP; revisitar após lançamento e conteúdo. Registrar em `docs/fontes.md`.
- [ ] **T0.6 (P0, 1 h) Hospedagem.** Confirmar limites/termos atuais do plano gratuito escolhido; registrar riscos do free tier e plano B.
- [ ] **T0.7 (P0, 1 h) ADRs.** `0001-stack.md` (Astro + TS puro) e `0002-sem-backend.md` (JSON estático, sem banco).

### Fase 1 — Fundação · ≈ 10 h · depende: T0.7

- [ ] **T1.1 (P0, 1 h)** Criar projeto Astro (template mínimo) + TypeScript estrito + `engines`. **Aceite:** `npm run dev` e `build` funcionam.
- [x] **T1.2 (P0, 1 h)** Biome (lint + format) e script `check`. **Aceite:** `npm run check` verde.
- [x] **T1.3 (P0, 1 h)** Vitest configurado com um teste trivial.
- [ ] **T1.4 (P0, 1 h)** Estrutura de pastas da seção 2 (vazia mas presente) + alias `@/`.
- [x] **T1.5 (P0, 1 h)** CI no GitHub Actions (seção 3, item 14). **Aceite:** PR com falha de lint bloqueia merge.
- [ ] **T1.6 (P0, 2 h)** `Base.astro`: `lang="pt-BR"`, metas, canonical, Open Graph, *skip link*, cabeçalho/rodapé, `global.css` com tokens (azul predominante, amarelo destaque, verde pontual; fonte mono do sistema para títulos/dezenas), `:focus-visible`, `prefers-reduced-motion`. **Aceite:** contraste AA nas combinações usadas.
- [ ] **T1.7 (P0, 1 h)** Páginas-esqueleto, `404.astro`, `@astrojs/sitemap`, `robots.txt`, `site` no `astro.config`.
- [ ] **T1.8 (P0, 1 h)** `README.md` (como rodar, testar, importar dados, publicar) e `.env.example`.
- [ ] **T1.9 (P0, 1 h)** Componente `Disclaimer.astro` (aviso padrão, texto único reutilizado em toda a UI).

### Fase 2 — Núcleo do domínio · ≈ 14 h · depende: Fase 1, T0.3

- [ ] **T2.1 (P0, 1 h)** `types.ts` e `rules.ts`. **Aceite:** TypeScript compila; nenhuma constante de regra fora de `rules.ts` (checagem por busca no code review).
- [x] **T2.2 (P0, 2 h)** `rng.ts` (mulberry32 + `newSeed`). **Testes:** determinismo por seed; valores em [0,1); distribuição grosseira (média ≈ 0,5).
- [x] **T2.3 (P0, 2 h)** `probability.ts` (F1–F3). **Testes:** os valores de conferência da seção 5.1; `comb(n,0)=1`, `comb(n,k)=comb(n,n−k)`; soma de `P(X=h)` sobre todos os h = 1.
- [x] **T2.4 (P0, 3 h)** `sampling.ts` (F10). **Testes:** tamanho correto; sem repetição; dentro de `[min,max]` (inclui Lotomania com 0); mesma seed ⇒ mesmo resultado; pesos iguais ⇒ frequência de cada dezena ≈ n/M em 20.000 simulações (tolerância fixa); peso extremo numa dezena ⇒ ela aparece quase sempre.
- [ ] **T2.5 (P0, 2 h)** `parseRequest()`: valida modalidade, quantidade (1–10), tamanho da aposta, opções; retorna `Result`; mensagens em português. **Testes:** entradas inválidas (NaN, strings, negativos, fora de faixa, objetos estranhos).
- [ ] **T2.6 (P0, 2 h)** `generateGames()` versão E0: lote sem jogos duplicados (quando possível) e erro claro quando não for possível. **Aceite:** teste com seed fixa e teste de propriedade (invariantes) com várias seeds.
- [ ] **T2.7 (P0, 2 h)** `format.ts`: `pad2`, formatação `Intl` pt-BR (inclui BigInt). **Testes:** `pad2(0)==="00"`.

### Fase 3 — Dados e estatísticas · ≈ 20 h · depende: T0.1, T2.1

- [ ] **T3.1 (P0, 3 h)** `etl/parse-csv.ts` (seção 4.3: BOM, encoding, delimitador, mapeamento por cabeçalho). **Testes:** colunas reordenadas, `;` e `,`, BOM, Latin-1, linhas extras.
- [ ] **T3.2 (P0, 2 h)** `etl/normalize.ts`: data → `AAAA-MM-DD` **sem `Date`**, dezenas → `number[]` ordenadas.
- [ ] **T3.3 (P0, 3 h)** `etl/validate.ts`: regras 1–6 da seção 4.3, erros com contexto (linha, campo, valor). **Aceite:** falha ⇒ nenhum arquivo gravado.
- [ ] **T3.4 (P0, 3 h)** `etl/import.ts` idempotente com merge e detecção de conflito. **Testes:** importar 2× ⇒ JSON idêntico; CSV incremental só acrescenta; conflito ⇒ erro; `--force` explícito.
- [x] **T3.5 (P0, 2 h)** `etl/check.ts` + script `data:check` no CI (schema, contiguidade, F13).
- [ ] **T3.6 (P0, 2 h)** Fixtures de regressão em `data/samples/`: válido, vazio, truncado, malformado, duplicado, fora de faixa. **Aceite:** cada caso tem mensagem de erro compreensível.
- [ ] **T3.7 (P0, 3 h)** `stats.ts`: F4, F5, F6, F13, distribuições (pares, faixas, soma) e **janela por últimos N concursos**. **Testes:** exemplos de 5–10 sorteios fictícios com resposta calculada à mão (frequência, atraso, z, janela, dezena nunca sorteada).
- [ ] **T3.8 (P1, 2 h)** F7 (χ² ajustado + p-valor). **Teste obrigatório:** simulação de 10.000 históricos uniformes (seed fixa) ⇒ ≈5% com p < 0,05 (tolerância definida no teste); confere também a aproximação de Wilson–Hilferty contra 2–3 valores de tabela χ².
- [ ] **T3.9 (P0, 1 h)** `ui/load-data.ts`: `fetch` lazy do JSON, verificação de `schemaVersion`, tratamento de falha de rede. **Aceite:** falha ⇒ o gerador E0 continua funcionando.
- [ ] **T3.10 (P0, 1 h)** Documentar em `docs/dados.md` o procedimento de atualização e a recuperação após mudança de formato.
- [ ] **T3.11 (P0, 1 h)** Importar os 4 históricos reais e commitar os JSON. **Aceite:** `data:check` verde; `lastContest`/`lastDate` conferem com o site oficial (conferência manual registrada).

### Fase 4 — Estratégias e filtros · ≈ 14 h · depende: Fase 2, T3.7

- [ ] **T4.1 (P0, 1 h)** `weights.ts` (F8, F9). **Testes:** `β=0` ⇒ todos os pesos 1; peso proporcional à frequência; sem pesos zero/NaN.
- [ ] **T4.2 (P0, 3 h)** `filters.ts`: faixas teóricas (F11): pares (hipergeométrica), soma, máx. por faixa de dezenas, sequência máxima. **Testes:** valores de conferência calculados à mão (ex.: Mega, pares); funciona para `n > d` (Lotomania 50).
- [ ] **T4.3 (P0, 2 h)** Rejeição com limite de tentativas e **relatório** (taxa de aceitação). **Teste:** restrições impossíveis ⇒ `Result` de erro, sem loop infinito.
- [ ] **T4.4 (P1, 2 h)** `diversify.ts` (F12). **Testes:** lote diversificado tem sobreposição máxima ≤ a de um lote não diversificado (em média, seed fixa).
- [ ] **T4.5 (P0, 2 h)** `generateGames()` completo: E0–E4 combináveis, devolvendo `{games, meta}` com `algorithmVersion`, `seed`, janela usada e taxa de aceitação.
- [ ] **T4.6 (P0, 1 h)** `describe.ts` (resumo educativo por jogo, seção 5.4). **Teste:** o texto nunca contém palavras da lista proibida.
- [ ] **T4.7 (P1, 2 h)** Calibrar `maxRun` por modalidade via simulação (100k sorteios, seed fixa); gravar em `rules.ts` com comentário e **teste que reproduz o cálculo**.
- [ ] **T4.8 (P0, 1 h)** `version.ts` com `ALGORITHM_VERSION` e changelog.
- [ ] **T4.9 (P2, 1 h)** Filtro "evitar padrão de calendário" (desligado por padrão; texto honesto).

### Fase 5 — Interface · ≈ 24 h · depende: Fases 3 e 4

- [ ] **T5.1 (P0, 4 h)** Página inicial: aviso, seletor de modalidade (cor **e** texto), quantidade 1–10, botão "Gerar combinações". Opções avançadas recolhidas (`<details>`): estratégia, janela, intensidade (Suave/Médio/Forte), filtros, diversificar. **Aceite:** gerar E0 funciona sem baixar nenhum dado.
- [ ] **T5.2 (P0, 3 h)** Resultados: dezenas legíveis, código do lote, resumo educativo, botões copiar / imprimir / WhatsApp. **Aceite:** texto copiado correto; erro de compartilhamento tratado.
- [ ] **T5.3 (P0, 3 h)** Histórico local (`history.ts`): versionado, limite 50, consultar/copiar/apagar, aviso "fica só neste navegador", renderização segura. **Teste:** dado corrompido no `localStorage` não quebra a página.
- [ ] **T5.4 (P0, 5 h)** `/estatisticas/[modalidade]`: tabela de frequência, atraso, z; **Top 10/15**, filtro de janela e ordenação (seção 5.2), pares/ímpares, faixas, histograma da soma, F7. Estático no build + interativo no cliente.
- [ ] **T5.5 (P0, 2 h)** Aviso de atualidade: "Dados até o concurso N (data)"; destaque se a data estiver defasada em relação ao dia atual.
- [ ] **T5.6 (P0, 2 h)** Estados: carregando, pronto, entrada inválida, falha, dados indisponíveis, histórico vazio, restrições impossíveis.
- [ ] **T5.7 (P0, 3 h)** Acessibilidade: teclado, foco, rótulos, mensagens de erro anunciáveis (`aria-live` só onde necessário), alvos de toque ≥ 44 px, estados sem depender de cor.
- [ ] **T5.8 (P1, 1 h)** CSS de impressão limpo.
- [ ] **T5.9 (P0, 1 h)** Medir orçamento de JS (≤ 30 KB gz) e registrar o resultado.

### Fase 6 — Conteúdo e páginas institucionais · ≈ 20 h · depende: Fases 4 e 5

- [ ] **T6.1 (P0, 4 h)** `/como-funciona` conforme a seção 6. **Aceite:** critérios (a)–(e).
- [ ] **T6.2 (P0, 3 h)** `/probabilidade` + **4 páginas de modalidade geradas de `rules.ts` e `probability.ts`** (regras, combinações, "1 em X", prêmios com fonte). Sem números digitados.
- [ ] **T6.3 (P0, 2 h)** `/dados`: origem, termos, frequência de atualização, última atualização, limitações.
- [ ] **T6.4 (P0, 2 h)** `/faq`, `/sobre` (sem vínculo com a CAIXA; quem mantém o projeto) e `/contato` (e-mail ou link de issues; sem formulário, sem coleta).
- [ ] **T6.5 (P0, 3 h)** `/privacidade` e `/termos` **como rascunho** + lista de pontos para revisão profissional. Conteúdo real: sem cadastro, sem analytics, só `localStorage`; hospedagem registra logs de acesso (verificar a política do provedor).
- [ ] **T6.6 (P0, 2 h)** SEO técnico: títulos/descrições únicos, canonical, Open Graph, dados estruturados **só se verdadeiros**.
- [ ] **T6.7 (P0, 2 h)** Revisão de texto por checklist de palavras proibidas e de alegações; todas as páginas usam `Disclaimer`.
- [ ] **T6.8 (P1, 2 h)** Página de changelog do algoritmo e dos dados.

### Fase 7 — Qualidade e publicação · ≈ 12 h · depende: Fase 6

- [ ] **T7.1 (P0, 4 h)** E2E (Playwright) em 3 fluxos: (1) gerar sem cadastro e copiar; (2) histórico: salvar, limite, apagar; (3) estatísticas: trocar janela e ordenação. **Aceite:** verde no CI.
- [ ] **T7.2 (P0, 2 h)** axe nos fluxos acima + revisão manual de teclado e leitor de tela; registrar **o que foi de fato verificado** (não declarar conformidade WCAG apenas por scanner).
- [ ] **T7.3 (P0, 2 h)** Cabeçalhos de segurança (`public/_headers`): CSP começando por `default-src 'self'` e **ajustada conforme o que o Astro realmente injeta** (hashes ou `'unsafe-inline'` só onde inevitável, documentado), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`; HSTS só após confirmar HTTPS. Documentar a finalidade de cada um.
- [ ] **T7.4 (P0, 1 h)** Domínio + HTTPS + deploy automático da `main`. **Aceite:** URL pública no ar.
- [ ] **T7.5 (P0, 1 h)** Medir Lighthouse / Core Web Vitals e registrar (sem prometer notas).
- [ ] **T7.6 (P0, 1 h)** `npm audit` e remoção de dependências sem uso.
- [ ] **T7.7 (P0, 1 h)** Checklist de lançamento (seção 9) concluída com evidências.

### Fase 8 — Pós-MVP (só com base em uso real)

- [ ] **T8.1 (P2)** *Backtest educativo:* "quanto cada estratégia teria acertado nos últimos N concursos vs. aleatório" — o resultado esperado é **empate estatístico**, e dizer isso é parte do valor didático. Média teórica de acertos por jogo = `n·d/M` (Mega com 6 dezenas: 0,6).
- [ ] **T8.2 (P1)** Outras modalidades (Dia de Sorte, Timemania, Dupla Sena, +Milionária): basta nova entrada em `rules.ts` + CSV + testes — **exceto** modalidades com mecânica extra (ex.: trevos, time do coração), que exigem desenho próprio.
- [ ] **T8.3 (P1)** Monetização: AdSense só após política revisada (T0.5), conteúdo original e consentimento (CMP) se aplicável. Alternativas: apoio voluntário.
- [ ] **T8.4 (P1)** Apoio via PIX **estático** (chave/QR de fonte confiável), com contador/contabilidade validados antes de divulgar. Sem dedutibilidade presumida.
- [ ] **T8.5 (P2)** PWA simples (manifest + ícone), sem service worker até haver estratégia contra dados desatualizados.
- [ ] **T8.6 (P2)** Atualização semiautomática dos dados (ex.: *workflow* agendado que abre PR) — **só** se houver fonte estável e permitida.
- [ ] **T8.7 (P2)** E-mail opcional: somente com necessidade comprovada; consentimento separado, *double opt-in*, descadastro, retenção definida. Exige provedor externo → deixa de ser "sem backend".
- [ ] **T8.8 (P2)** Analytics de coleta mínima, sem cookies, sem enviar combinações; verificar o que a ferramenta realmente coleta.

---

## 8. Fora do MVP (e por quê)

| Item | Motivo |
|---|---|
| Backend / API / banco de dados | Dados cabem em JSON estático; menos superfície de ataque, custo zero |
| Login / contas | O produto não precisa; evita LGPD desnecessária |
| React / Vue / Svelte | O gerador é um formulário; TS puro basta |
| Tailwind / bibliotecas de UI | CSS próprio pequeno é mais barato de manter |
| Docker / Kubernetes | Nada para orquestrar |
| Rate limiting, CAPTCHA, Turnstile | Não há endpoint público a abusar |
| Raspagem automática da CAIXA | Fonte/termos incertos; CSV manual é mais seguro |
| E-mail, newsletter, PIX dinâmico/webhook | Complexidade jurídica e técnica sem validação de demanda |
| Analytics, anúncios, CMP | Peso, LGPD e política de terceiros antes de ter produto |
| Service worker / offline | Risco de dados históricos desatualizados |
| Banner de cookies | Se nada não essencial é carregado, não há o que consentir — **confirmar com o inventário (T6.5)** |
| Qualquer texto que sugira previsão | Contraria o princípio do produto |

---

## 9. Definição de pronto e checklist de lançamento

**Definição de pronto (toda tarefa)**
- [ ] Critério de aceite atendido e verificável
- [ ] Testes novos/ajustados passando; `npm run check` verde
- [ ] Sem `any`, sem código morto, sem constante de regra fora de `rules.ts`
- [ ] Documentação atualizada se houve mudança de fórmula, formato ou comando
- [ ] Nenhum texto sugere vantagem estatística

**Checklist de lançamento**
- [ ] 4 históricos importados e conferidos manualmente com a fonte oficial
- [ ] F1–F13 documentadas, testadas e exibidas em `/como-funciona`
- [ ] Teste de uniformidade (F7) validado por simulação
- [ ] Aviso de probabilidade visível no gerador, nos resultados e no rodapé
- [ ] Gerador funciona sem rede (E0) e degrada com clareza quando os dados falham
- [ ] E2E, axe e revisão manual de acessibilidade registrados
- [ ] Cabeçalhos de segurança validados no navegador
- [ ] `/privacidade` e `/termos` revisados por profissional **ou** publicados como rascunho assumido, ciente do risco
- [ ] Nome/domínio verificados (INPI incluído) e sem sugestão de vínculo oficial
- [ ] Backup = repositório Git remoto; procedimento de restauração do site documentado
- [ ] Plano de resposta a incidentes de uma página em `docs/`

**Manutenção**
- A cada novo concurso (ou semanalmente): baixar CSV → `data:import` → revisar diff → commit.
- Mensal: `npm audit`, atualizar dependências em PR separado, conferir `/dados`.
- A cada mudança de método: subir `ALGORITHM_VERSION` e registrar no changelog.

---

## 10. Pendências que dependem de você / de confirmação externa

1. Formato real dos CSVs/planilhas (T0.1) — pode exigir ajuste no mapeamento de cabeçalhos.
2. Termos de uso dos dados da CAIXA (T0.2).
3. Regras vigentes de aposta de cada modalidade (T0.3) — os números em `rules.ts` acima são ponto de partida, **não** fonte confirmada.
4. Política do AdSense para loteria (T0.5) e enquadramento fiscal de qualquer receita (contador).
5. Revisão jurídica dos documentos legais (T6.5).
6. Nome, domínio e marca (T0.4).

Próxima ação recomendada: **T0.1** (baixar os CSVs e documentar o formato). Todo o resto do ETL depende dela.
