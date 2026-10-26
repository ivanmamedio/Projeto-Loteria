# Fontes consultadas

Registro de fontes usadas no projeto: URL, data de consulta, o que confirma e decisão tomada.

---

## T0.1 — Dados históricos das loterias

| Item | Valor |
|---|---|
| **URL** | https://lotoagora.com.br/downloads/ (dados derivados da API oficial da CAIXA) |
| **Fonte original** | CAIXA — https://servicebus3.caixa.gov.br/portaldeloterias/api/ |
| **Data de consulta** | 2026-10-23 |
| **O que confirma** | Baixei 4 CSVs completos (Mega-Sena 3.073, Lotofácil 3.811, Quina 7.149, Lotomania 2.990 concursos), bem como amostras em `data/raw/` e `data/samples/`. Formato documentado em `docs/dados.md`. |
| **Decisão** | Dados públicos da CAIXA; derivados de fontes oficiais abertas. O uso para análise e publicação do site é permitido. |
| **Risco** | O site não deve apresentar os dados como publicação oficial da CAIXA; sempre manter a indicação de fonte e a advertência de que a conferência oficial é feita pela CAIXA. |

---

## T0.2 — Termos de uso dos dados

| Item | Valor |
|---|---|
| **URL consultada** | https://lotoagora.com.br/licenca-dados/v1/ (licença da compilação de resultados) |
| **Data de consulta** | 2026-10-23 |
| **O que confirma** | A licença da compilação (LotoAgora v1.0, 13/10/2026) **permite consultar, baixar, analisar e redistribuir**, inclusive em estudos e aplicações comerciais, **desde que** se identifique o compilador (LotoAgora) e a fonte (CAIXA), informe a modalidade, os concursos abrangidos e a data de acesso, e não apresente a cópia como publicação **oficial** da CAIXA. Também pode indicar alterações feitas. |
| **Decisão** | `data/raw/` (CSVs completos) **entra no Git** para garantir revisibilidade e reprodutibilidade. O JSON derivado (`concurso/data/dezenas`) também pode ser publicado. O site deve manter um aviso de que os dados são de origem pública da CAIXA e não substitui a confirmação oficial. |
| **Limite** | O uso não registra apostas, não prevê sorteios e não garante prêmio. O acesso à CAIXA oficial permanece como fonte primária. |

---

## T0.3 — Regras oficiais das 4 modalidades

| Modalidade | Universo (volante) | Sorteio | Preço mínimo | Fonte oficial |
|---|---|---|---|---|
| **Mega-Sena** | 60 dezenas | 6 dezenas | R$ 6,00 (6 dezenas); R$ 6,00 por combinação a partir de 7 | https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx |
| **Lotofácil** | 25 dezenas | 15 dezenas | R$ 3,50 (15 dezenas); R$ 3,50 por combinação a partir de 16 | https://loterias.caixa.gov.br/Paginas/LOTOFACIL.aspx |
| **Quina** | 80 dezenas | 5 dezenas | R$ 3,00 (5 dezenas); R$ 3,00 por combinação a partir de 6 | https://loterias.caixa.gov.br/Paginas/QUINA.aspx |
| **Lotomania** | 100 dezenas (00–99) | 20 dezenas | R$ 3,00 fixo (50 dezenas, único tarifa) | https://loterias.caixa.gov.br/Paginas/Lotomania.aspx |

### Detalhes das regras

| Modalidade | `universo` | `dezenasSorteadas` | `minDezenas` | `maxDezenas` | `premiacao` (aceitos) |
|---|---|---|---|---|---|
| Mega-Sena | 60 | 6 | 6 | 20 | 6 (Sena), 5 (Quina), 4 (Quadra) |
| Lotofácil | 25 | 15 | 15 | 20 | 15, 14, 13, 12, 11 |
| Quina | 80 | 5 | 5 | 15 | 5 (Quina), 4 (Quadra), 3 (Terno), 2 (Duque) |
| Lotomania | 100 | 20 | 50 | 50 | 20, 19, 18, 17, 16, 15, 0 |

### Concursos da teimosinha

| Modalidade | Concursos consecutivos |
|---|---|
| Mega-Sena | 2, 3, 4, 6, 8, 9, 12 |
| Lotofácil | 2, 3, 4, 6, 8, 9, 12, 18, 24 |
| Quina | 3, 6, 12, 18, 24 |
| Lotomania | 2, 3, 4, 6, 8, 9, 12 |

### Decisão

- As regras foram confirmadas nas páginas **"Como jogar"/"Apostas"** do Portal Loterias CAIXA em **2026-10-23**.
- `src/domain/rules.ts` é a única tabela de regras do codebase. Nenhum `60`, `6`, `25`, `80`, `100` ou `50` deve aparecer hardcodeado em páginas, ETL ou gerador.
- A caixa branca `// src/domain/rules.ts — ÚNICA fonte das regras (CONFIRMAR na T0.3 com as regras oficiais vigentes)` foi removida; a confirmação oficial está registrada nesta seção.
- **Aviso de probabilidade:** toda combinação tem a mesma probabilidade de sorteio — nenhum texto, tabela ou adesivo do site pode sugerir vantagem estatística.

### Risco

- O site **não deve** apresentar os dados ou as regras como publicação oficial da CAIXA. Mantém sempre a indicação de fonte e a advertência de que a confirmação oficial é feita pela CAIXA.
- Nomes "Mega-Sena", "Lotofácil", "Quina", "Lotomania" são marcas da CAIXA; o site deve evitar qualquer menção que sugira vínculo oficial, conforme registro de marca consultado aualmente via INPI (ver `T0.4`).


---

## T0.5 — Política do AdSense para loteria

| Item | Valor |
|---|---|
| **Fonte consultada** | Google AdSense — Política de conteúdo e Política de conteúdo para sites de apostas/esportes e jogos de azar |
| **Data de consulta** | 2026-10-23 |
| **Decisão recomendada** | **Não monetizar no MVP** — revisitar após lançamento e conteúdo |
| **Risco** | Conteúdo de loteria está sujeito a restrições rígidas do AdSense; a não adesão pode resultar em banimento da conta ou perda de receita |
| **Próximos passos** | (a) Revisitar a política a cada lançamento; (b) formar conteúdo original/educativo antes de considerar monetização; (c) implementar consentimento (CMP) se houver anúncios |

*Nota: tarefa de pesquisa/documentação; não exige código.*

---

## T0.6 — Hospedagem (resumo)

| Item | Valor |
|---|---|
| **Plano testado** | Cloudflare Pages (grátis) ou GitHub Pages |
| **Verificar** | Limites de armazenamento estático, CI/CD, custos, plano B |
| **Risco** | Free tier com limites de tráfego/banda; pré-fab de resposta 404/estático |

---

## T0.7 — ADRs (Resumo)

| Item | Valor |
|---|---|
| **ADR 0001** | `docs/adr/0001-stack.md` — Astro + TypeScript puro |
| **ADR 0002** | `docs/adr/0002-sem-backend.md` — JSON estático, sem banco |
| **Prazo** | T0.7 antes de Fase 1 (dependência de T1.x) |
