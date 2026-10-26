# Formato dos CSVs oficiais (T0.1)

Fonte: LotoAgora (derivado da CAIXA), arquivos baixados em 2026-10-23.
URL de origem: https://lotoagora.com.br/downloads/

## Características gerais

- **Extensão:** `.csv`
- **Delimitador:** `;` (ponto e vírgula)
- **Encoding:** UTF-8 com BOM (`﻿` no início do arquivo)
- **Quoting:** todos os campos entre aspas duplas (`"..."`); aspas internas escapadas como `""`
- **Quebra de linha:** `\n` (LF)
- **Ordenação:** decrescente por número do concurso (mais recente primeiro)
- **Uma linha por concurso**

## Cabeçalhos (comuns às 4 modalidades)

```
concurso;data;dezena_1;...;dezena_N;segundo_sorteio;trevos;mes;time;acumulado;
ordem_sorteio;ordem_segundo_sorteio;ordem_trevos;fonte;premios_json;
rateio_estado;rateio_fonte;rateio_consultado_em;rateio_observacao;
ordem_fonte;ordem_consultada_em
```

### Colunas específicas por modalidade

| Modalidade | dezenas | colunas de dezena |
|---|---|---|
| Mega-Sena | 6 | dezena_1 … dezena_6 (1–60) |
| Lotofácil | 15 | dezena_1 … dezena_15 (1–25) |
| Quina | 5 | dezena_1 … dezena_5 (1–80) |
| Lotomania | 20 | dezena_1 … dezena_20 (0–99) |

## Faixa de concursos

| Modalidade | arquivo | linhas (concursos) | primeiro (mais antigo) | último (mais recente) |
|---|---|---|---|---|
| Mega-Sena | mega-sena.csv | 3073 | 1 (1996-03-11) | 3073 (2026-10-22) |
| Lotofácil | lotofacil.csv | 3811 | 1 (2003-09-29) | 3811 (2026-10-22) |
| Quina | quina.csv | 7149 | 1 (1994-03-13) | 7149 (2026-10-22) |
| Lotomania | lotomania.csv | 2990 | 1 (1999-10-02) | 2990 (2026-10-21) |

## Colunas relevantes para o ETL

- `concurso`: número do sorteio (inteiro)
- `data`: data do sorteio (ISO `YYYY-MM-DD`)
- `dezena_1..N`: dezenas sorteadas (strings numéricas)
- `acumulado`: `"sim"` ou `"não"`
- `ordem_sorteio`: dezenas na ordem em que foram sorteadas (string separada por espaço)
- `fonte`: URL da API da CAIXA usada como fonte

## Linhas "extras" / campos vazios

- `segundo_sorteio`, `trevos`, `mes`, `time`: vazios para as 4 modalidades (não aplicável)
- `ordem_segundo_sorteio`, `ordem_trevos`: vazios
- `rateio_estado`, `rateio_observacao`: frequentemente vazios
- Campos ausentes na origem ficam vazios (não são zero)

## Como atualizar

1. Baixar novos CSVs de https://lotoagora.com.br/downloads/
2. Substituir em `data/raw/`
3. Rodar `npm run data:import` (a implementar em T1.2)
4. Revisar diff no Git antes de commitar
"""