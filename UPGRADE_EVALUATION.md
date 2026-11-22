# 📋 Avaliação de Upgrade — Astro 5+ / Vitest 5+ / TypeScript 7+

**Data:** 2026-11-22  
**Versão Atual:** Astro 4.16.19, Vitest 1.6.1, TypeScript 5.9.3  
**Versões Alvo:** Astro 7.x, Vitest 5.x, TypeScript 7.x

---

## ⚠️ Resumo Executivo

| Pacote | Atual | Latest | Risco | Esforço Estimado |
|--------|-------|--------|-------|------------------|
| **Astro** | 4.16.19 | 7.4.13 | 🔴 **Muito Alto** | 2-4 dias |
| **Vitest** | 1.6.1 | 5.1.1 | 🟠 **Alto** | 1-2 dias |
| **TypeScript** | 5.9.3 | 7.0.2 | 🟡 **Médio** | 0.5-1 dia |
| **@biomejs/biome** | 1.9.4 | 2.6.8 | 🟠 **Alto** | 0.5 dia |

**Recomendação:** **NÃO UPGRADE AGORA**. O projeto está estável, funcional e com 139 testes passando. Upgrades maiores introduzem risco sem benefício imediato para um site estático em produção.

---

## 🔴 Astro 5+ → 7.x — Breaking Changes Críticos

### Mudanças que Afetam Este Projeto

| Área | Mudança | Impacto |
|------|---------|---------|
| **API Routes** | `export const GET` → `export async function GET()` | 🔴 Todos os 3 endpoints (`/api/probabilidade`, `/api/validacao`, `/api/backtest`) |
| **Middleware** | Nova API `defineMiddleware()` | 🟡 Não usa middleware atualmente |
| **Adapters** | `@astrojs/cloudflare`, `@astrojs/netlify` etc. movidos para packages separados | 🟡 Usa `output: 'static'` + GitHub Pages |
| **Assets** | `import.meta.glob` behavior changes | 🟡 Build estático pode ser afetado |
| **Content Collections** | Nova API obrigatória | 🟢 Não usa |
| **i18n** | Nova API built-in | 🟢 Não usa |

### Código a Migrar (Astro 5+)

```typescript
// ANTES (Astro 4 - atual)
export const GET: APIRoute = async ({ url }) => { ... }

// DEPOIS (Astro 5+)
export async function GET({ url }: APIContext) { ... }
```

### Arquivos Afetados
- `src/pages/api/probabilidade.ts`
- `src/pages/api/validacao.ts`  
- `src/pages/api/backtest.ts`

---

## 🟠 Vitest 5.x — Breaking Changes

### Mudanças Principais

| Mudança | Impacto |
|---------|---------|
| **Configuração** | `vitest.config.ts` → novo formato `defineConfig` | 🟡 |
| **Mocking** | `vi.fn()` behavior changes, `vi.mock` hoisting | 🔴 20 arquivos de teste usam `vi` |
| **TypeScript** | Requer TS 5.0+ | ✅ Já em 5.9.3 |
| **Coverage** | `@vitest/coverage-v8` → `@vitest/coverage-v8` v5 | 🟡 |

### Código a Migrar

```typescript
// ANTES
import { describe, it, vi } from 'vitest'
vi.mock('./module')

// DEPOIS (Vitest 5)
import { describe, it, vi } from 'vitest'
vi.mock('./module', async () => ({ ... }))
```

### Arquivos de Teste Afetados (20 arquivos)
- `src/domain/backtest.test.ts` - usa `vi.fn()`
- `src/ui/load-data.test.ts` - usa `vi.stubGlobal`, `vi.fn()`
- Todos os testes que usam `vi.fn()`, `vi.mock`, `vi.spyOn`

---

## 🟡 TypeScript 7.x — Mudanças

### Principais Mudanças
- **Decorators** - nova sintaxe padrão (stage 3)
- **`exactOptionalPropertyTypes`** - mais estrito (já habilitado no projeto)
- **`noUncheckedIndexedAccess`** - já habilitado
- **Node.js types** - `@types/node` v22+ requer Node 20+

### Impacto no Projeto
- `tsconfig.json` já tem `strict: true`, `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`
- Provavelmente **compatível sem mudanças** — apenas testar

---

## 🟠 Biome 2.x — Breaking Changes

### Mudanças
- Nova configuração JSONC
- Regras renomeadas/removidas
- Formatter changes

### Impacto
- `biome.json` precisa migração
- `noNonNullAssertion: off` pode mudar de nome

---

## 📊 Plano de Migração Recomendado (Se Necessário)

### Fase 1: Preparação (1 dia)
1. Criar branch `upgrade/astro-7-vitest-5`
2. Atualizar `package.json` com versões alvo
3. Rodar `npm install` e analisar erros

### Fase 2: Astro 7 (2-3 dias)
1. Migrar 3 API routes para nova sintaxe
2. Verificar `astro.config.mjs` compatibilidade
3. Testar `npm run build`
4. Corrigir warnings/erros

### Fase 3: Vitest 5 (1-2 dias)
1. Atualizar `vitest.config.ts`
2. Migrar mocks em 20 arquivos de teste
3. Rodar `npm run test:unit` até 139 passarem

### Fase 4: TypeScript 7 + Biome 2 (0.5-1 dia)
1. Atualizar `tsconfig.json` se necessário
2. Migrar `biome.json`
3. Rodar `npm run check` + `tsc --noEmit`

### Fase 5: Validação Completa (0.5 dia)
1. `npm run test:unit` (139 testes)
2. `npm run test:e2e` (Playwright)
3. `npm run build`
4. Deploy em preview (GitHub Pages branch)

---

## ✅ Critérios de "Pronto para Upgrade"

- [ ] 139 testes unitários passando
- [ ] 0 erros TypeScript
- [ ] 0 erros Biome
- [ ] Build estático bem-sucedido
- [ ] E2E tests passando (Playwright)
- [ ] Deploy preview funcional
- [ ] Performance igual ou melhor (Lighthouse)

---

## 🎯 Decisão Final

| Fator | Peso | Avaliação |
|-------|------|-----------|
| **Estabilidade atual** | 🔴 Crítico | 139 testes passam, build OK, produção funcional |
| **Benefício do upgrade** | 🟡 Baixo | Novas features não necessárias para site estático |
| **Risco de regressão** | 🔴 Alto | 20 arquivos de teste + 3 API routes + config |
| **Tempo de engenharia** | 🟠 Médio | 4-8 dias totais |
| **Suporte LTS atual** | 🟢 OK | Astro 4.x ainda suportado |

**VEREDITO: MANTER VERSÕES ATUAIS**

Reavaliar em:
- Astro 4.x end-of-life
- Necessidade de feature específica do Astro 5+
- Vulnerabilidade crítica não mitigável em dev-only

---

## 📝 Próximos Passos (Se Decidido Upgrade Futuro)

1. **Monitorar** Astro 4.x security advisories
2. **Documentar** breaking changes em `CHANGELOG.md`
3. **Criar** branch de upgrade quando houver janela de manutenção
3. **Testar** em ambiente de staging antes de merge