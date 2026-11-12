# Metodologia — Fórmulas e Algoritmos

**Fonte única** para todas as fórmulas F1–F13 usadas no projeto.
A página `/como-funciona` deriva deste documento.
Nenhum valor numérico deve ser digitado à mão nas páginas — tudo calculado via código.

---

## Notação

| Símbolo | Significado |
|---|---|
| **M** | Universo de dezenas (Mega-Sena: 60, Lotofácil: 25, Quina: 80, Lotomania: 100) |
| **d** | Dezenas sorteadas por concurso (Mega: 6, Lotofácil: 15, Quina: 5, Lotomania: 20) |
| **n** | Dezenas na aposta do usuário |
| **N** | Concursos na janela analisada |
| **p = d/M** | Probabilidade de uma dezena ser sorteada |
| **fᵢ** | Frequência da dezena *i* na janela |
| **aᵢ** | Atraso da dezena *i* (concursos desde última aparição) |
| **β** | Parâmetro de intensidade (padrão 1.0; presets: Suave 0.5, Médio 1, Forte 2) |

---

## F1–F3 — Probabilidade (igual para todos)

| ID | Fórmula | Uso |
|---|---|---|
| **F1** | `C(M, d) = M! / (d! · (M−d)!)` | Total de combinações possíveis |
| **F2** | `P(sua combinação) = 1 / C(M, d)`; com **m jogos distintos**: `m / C(M, d)` | Única forma real de aumentar a chance: mais combinações distintas |
| **F3** | `P(X=h) = C(n, h) · C(M−n, d−h) / C(M, d)` (hipergeométrica) | Chance de *h* acertos com aposta de *n* dezenas |

**Valores de conferência (devem constar nos testes):**
- `C(60, 6) = 50.063.860` (Mega-Sena)
- `C(25, 15) = 3.268.760` (Lotofácil)
- `C(80, 5) = 24.040.016` (Quina)
- `C(100, 20)` → Lotomania usa 50 dezenas fixas

---

## F4–F7 e F13 — Métricas descritivas (sobre o histórico)

| ID | Fórmula | Leitura |
|---|---|---|
| **F4** | `fᵢ` = nº de concursos da janela que contêm *i*; esperado `E = N · d / M` | Quantas vezes saiu vs. esperado |
| **F5** | `aᵢ = (N−1) − índice da última aparição`; se nunca apareceu, `aᵢ = N` | Quantos concursos faz que não sai |
| **F6** | `zᵢ = (fᵢ − E) / √(N · p · (1−p))` — exato: `fᵢ ~ Binomial(N, p)` | Quão longe do esperado, em desvios-padrão |
| **F7** | `X² = Σ (fᵢ−E)²/E` ; **`χ²_aj = X² · (M−1)/(M−d)`**, `gl = M−1` ; p-valor via **incomplete gamma** (exato) | Teste de uniformidade do histórico |
| **F13** | Soma `S`: média teórica `E[S] = d·(min+max)/2`; variância `Var[S] = d·σᵤ²·(M−d)/(M−1)`, `σᵤ² = (M²−1)/12` | Compara soma histórica com teórica; valida ETL |

**Notas críticas:**
- Fator `(M−1)/(M−d)` em F7 existe porque dezenas saem **sem reposição** (covariância negativa).
- **Teste obrigatório**: simular 10.000 históricos uniformes (seed fixa) → ≈5% com p < 0,05.
- Em F6, com M=60, há **~94%** de chance de pelo menos uma dezena ter \|z\| > 2. "Fora do normal" é o normal.
- Valores F13: Mega `E[S]=183` (σ≈40,6) · Lotofácil `195` (σ≈18,0) · Quina `202,5` · Lotomania `990`.

---

## F8–F9 — Pesos de frequência e atraso

| ID | Estratégia | Pesos | Observação honesta |
|---|---|---|---|
| **F8 (E1)** | Mais frequentes | `wᵢ = ((fᵢ+1)/(f̄+1))^β` | `β=0` volta ao uniforme. Presets: Suave 0,5 · Médio 1 · Forte 2 |
| **F9 (E2)** | Mais atrasadas | `wᵢ = ((aᵢ+1)/(ā+1))^β` | Mesma ideia com atraso. **Não existe "dívida" estatística** |

---

## F10 — Amostragem ponderada sem reposição (Efraimidis–Spirakis)

Para cada dezena sorteie `uᵢ ~ U(0,1)`, calcule a chave `kᵢ = ln(uᵢ)/wᵢ` e escolha as **n maiores chaves**.
- Com pesos iguais → uniforme.
- Sem viés de módulo, sem laço de rejeição.
- PRNG: **mulberry32** com seed de 32 bits via `crypto.getRandomValues`.

---

## F11 — Filtros de equilíbrio (por rejeição)

Gera o jogo (F10) e **aceita somente se** passar em todos os filtros ativos; senão sorteia de novo (máx. 10.000 tentativas; taxa de aceitação exibida).

Intervalos são **teóricos, calculados do universo** (não do histórico):

| Filtro | Intervalo (central ≥ 80% da distribuição) |
|---|---|
| **Pares** | `lo = min h com CDF(h) > 0,10`; `hi = max h com 1−CDF(h−1) > 0,10` (hipergeométrica) |
| **Soma** | `E[S] ± 1,2816·σ` (F13 com `d` trocado por `n`), arredondando para fora |
| **Máx. por faixa (01–10, 11–20…)** | `⌈n / nº de faixas⌉ + 1` |
| **Sequência máxima** | Calibrado por simulação (percentil 90) por modalidade → gravado em `rules.ts` |
| **Evitar calendário** (P2, desligado) | ≥ ⅓ das dezenas > 31. **Heurística de diversificação**, sem efeito na chance |

---

## F12 — Diversificação do lote (guloso, min-max de sobreposição)

1. Gerar `K = max(30, 20·jogos)` candidatos com a estratégia escolhida.
2. Escolher o primeiro; cada próximo minimiza a **maior interseção** `|c ∩ s|` com os já escolhidos (desempate: menor soma de interseções).
3. Em Lotofácil (15 de 25) a interseção mínima entre dois jogos já é 5; o método minimiza o excesso.

---

## F-Fibonacci — Análise de distribuição de Fibonacci (educativa)

> **Princípio**: A sequência de Fibonacci é um padrão matemático interessante para análise de distribuição e espaçamento, mas **NÃO confere vantagem estatística** em sorteios justos onde todas as combinações têm mesma probabilidade.

### F-Fib.1 — Verificação de Fibonacci
Um número *x* pertence à sequência se `5·x² + 4` ou `5·x² − 4` for quadrado perfeito.
Implementado com **BigInt** para precisão arbitrária (`src/domain/fibonacci.ts`).

### F-Fib.2 — Análise de distribuição no jogo
Para um jogo gerado, calcula:
- `fibonacciCount`: quantas dezenas são de Fibonacci
- `fibonacciNumbers`: quais são
- `maxGap`: maior gap entre Fibonacci consecutivos no jogo
- `avgGap`: gap médio
- `ratioToUniverse`: proporção vs. total de Fibonacci no universo

Usado no **resumo educativo** (`describe.ts`) — não altera probabilidade.

### F-Fib.3 — Peso adaptativo no `patternWeights` (fator opcional)
Adicionado como **9º fator** no espaço log do `patternWeights` (`src/domain/patterns.ts`):

```typescript
// Proporção teórica de Fibonacci no universo
const fibRatioTeorico = fibs.length / universo;

// Proporção observada no histórico recente (últimos 20 concursos)
const fibRatioHistorico = fibFreq / totalDezenas;

// Bias: se histórico tem MAIS Fibonacci que o esperado → penaliza Fibonacci (0.85)
//       se histórico tem MENOS Fibonacci que o esperado → favorece Fibonacci (1.15)
//       sem histórico → pesos neutros (1.0)
const bias = (fibRatioHistorico > fibRatioTeorico ? -0.15 : 0.15) * fibonacciIntensidade;
```

**Intensidade configurável** (mesma lógica do β de E1/E2):
- **Suave** (`0.5`): bias ±7.5%
- **Médio** (`1.0`, padrão): bias ±15%
- **Forte** (`2.0`): bias ±30%

- **Não-invasivo**: combina no espaço log (média geométrica) com os outros 8 fatores.
- **Suave**: bias máximo ±30% em intensidade forte (não bloqueia como filtro).
- **Auto-equilibrante**: contrabalanceia viés histórico detectado.
- **Honesto**: comentário explícito "NÃO altera probabilidade real".

---

## Estratégias de montagem (selecionáveis no gerador)

Todas usam **a mesma amostragem F10**; só mudam os pesos.

| ID | Estratégia | Pesos | Observação honesta |
|---|---|---|---|
| **E0** | Aleatório uniforme (padrão) | `wᵢ = 1` | Referência. Não precisa de dados históricos |
| **E1** | Mais frequentes | **F8** | `β` controla intensidade |
| **E2** | Mais atrasadas | **F9** | Não existe "dívida" estatística |
| **E3** | Equilibrado (filtros) | **F11** | Restringe formato; não muda chance |
| **E4** | Diversificar o lote | **F12** | Evita jogos muito parecidos entre si |
| **Padrões** | Padrões avançados | **patternWeights** (8 fatores + F-Fib) | Combinação no espaço log |

---

## Resumo educativo por jogo (`describe.ts`)

Exemplo de saída:
> "Jogo gerado por **Mais frequentes (β=1)** na janela dos últimos 100 concursos. Contém 3 dezenas entre as 10 mais sorteadas do período · 4 pares / 2 ímpares · soma 171 (faixa teórica central: 143–223) · maior sequência: 2 · **2 dezenas de Fibonacci (5, 13)** · **Isto descreve o jogo; não altera sua probabilidade.**"

---

## Reprodutibilidade e transparência

- PRNG: **mulberry32** com seed de 32 bits via `crypto.getRandomValues`.
- **Código do lote** (seed em hex) aparece no resultado e é salvo no histórico.
- Mesmo código + mesmas opções + mesma versão ⇒ mesmos jogos.
- `ALGORITHM_VERSION` (`src/domain/version.ts`) em cada lote; mudanças vão para changelog público.
- Para entretenimento, mulberry32 é suficiente; **não** é para fins de segurança.

---

## Limitações e responsabilidade

- Entretenimento/estudo; sem vínculo com a CAIXA.
- Jogue com responsabilidade; público adulto.
- **Nenhum método aumenta a chance de ganhar**; aqui você escolhe *como* montar seus jogos, não *se* vai ganhar.