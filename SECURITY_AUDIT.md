# 🔒 Relatório de Auditoria de Segurança — Projeto Loteria

**Data:** 2026-11-08  
**Projeto:** Site estático Astro 4.16.19 → GitHub Pages  
**Classificação:** Baixo risco (site estático, sem backend, sem auth, sem dados sensíveis)

---

## 📋 Resumo Executivo

| Categoria | Risco | Status |
|-----------|-------|--------|
| **Dependências (Astro 4.x)** | Crítico* | Mitigado (site estático) |
| **XSS / Injeção HTML** | Baixo | Código revisado |
| **CSP / Headers** | Médio | ❌ Não implementado |
| **Supply Chain** | Médio | Deps desatualizadas |
| **Build/Deploy** | Baixo | GitHub Pages (confiável) |
| **Dados Sensíveis** | Nenhum | Não há |

> *As vulnerabilidades críticas do Astro 4.x (XSS, RCE, SSRF) afetam **dev server, middleware, server islands, image optimization** — **não se aplicam ao build estático** (`astro build`) servido no GitHub Pages.

---

## 🔍 Análise Detalhada

### 1. Vulnerabilidades de Dependências (npm audit)

| Pacote | Versão Atual | Vulnerabilidades | Aplicável em Produção? |
|--------|--------------|------------------|------------------------|
| `astro` 4.16.19 | 18 CVEs (XSS, RCE, SSRF, Auth Bypass) | ❌ Não (dev server, middleware, islands) |
| `esbuild` ≤0.24.2 | Dev server exposure | ❌ Não (dev only) |
| `vite` ≤6.4.3 | Dev server | ❌ Não (dev only) |
| `vitest` 1.6.1 | Test runner | ❌ Não (test only) |

**Conclusão:** Build estático (`astro build`) + GitHub Pages **não expõe** essas vulnerabilidades.

---

### 2. Análise de Código — XSS / Injeção

#### ✅ Pontos Seguros
- **Nenhum `innerHTML` com input do usuário** — dados vêm de JSONs estáticos (`public/data/*.json`)
- **Templates Astro** escapam automaticamente expressões `{valor}`
- **`localStorage`** usado apenas para tema/histórico local (client-side only)
- **API `/api/validacao`** é **read-only** (GET only, sem escrita)

#### ⚠️ Pontos de Atenção
| Arquivo | Linha | Risco | Mitigação |
|---------|-------|-------|-----------|
| `Base.astro` | `style="stroke: currentColor;"` | Baixo | Atributo controlado |
| `index.astro` | `progressContainer.innerHTML = \`...\`` | **Médio** | Template string com variáveis controladas |
| `index.astro` | `meta.textContent = ...` | Baixo | `textContent` escapa automaticamente |
| `index.astro` | `window.open(wa.me...)` | Baixo | URL codificada |

#### 🔧 Correção Recomendada
Substituir `innerHTML` por `createElement` + `textContent` em `index.astro` (progress container).

---

### 3. Headers de Segurança (CSP, HSTS, etc.)

#### ❌ Ausentes
| Header | Status | Risco |
|--------|--------|-------|
| `Content-Security-Policy` | ❌ Ausente | XSS não mitigado |
| `X-Frame-Options` | ❌ Ausente | Clickjacking |
| `X-Content-Type-Options` | ❌ Ausente | MIME sniffing |
| `Referrer-Policy` | ❌ Ausente | Vazamento de referrer |
| `Permissions-Policy` | ❌ Ausente | APIs perigosas |
| `Cross-Origin-Opener-Policy` | ❌ Ausente | Isolamento |

#### ✅ Implementação Necessária
GitHub Pages suporta headers via `_headers` (já existe `public/_headers`).

---

### 4. Supply Chain (Dependências)

| Pacote | Atual | Latest | Ação |
|--------|-------|--------|------|
| `astro` | 4.16.19 | 7.4.7 | ⚠️ Breaking change (Astro 5+) |
| `@biomejs/biome` | 1.9.4 | 2.6.6 | ✅ Patch safe |
| `@playwright/test` | 1.64.1 | 1.65.0 | ✅ Patch safe |
| `typescript` | 5.9.3 | 7.0.2 | ✅ Patch safe |
| `vitest` | 1.6.1 | 5.1.0 | ⚠️ Major (config changes) |

**Recomendação:** Atualizar patches (`biome`, `playwright`, `typescript`). Avaliar Astro 5+ separadamente.

---

### 5. API `/api/validacao` (Server-side)

```typescript
// src/pages/api/validacao.ts
export const GET: APIRoute = async ({ url }) => {
  const modalidade = url.searchParams.get('modalidade');
  // ... carrega JSON público, roda validação estatística
  return new Response(JSON.stringify({ ... }), { headers: { 'Content-Type': 'application/json' } });
}
```

| Aspecto | Status |
|---------|--------|
| **Método** | GET only ✅ |
| **Input validation** | `modalidade` validado contra lista permitida ✅ |
| **Rate limiting** | ❌ Ausente (GitHub Pages não suporta nativamente) |
| **CORS** | ❌ Não configurado (padrão: same-origin) |
| **DoS potential** | Baixo (cálculo estatístico leve, histórico < 8k linhas) |

---

### 6. Build & Deploy (GitHub Pages)

| Vetor | Status |
|-------|--------|
| **Branch protection** | ❌ Não verificado (recomendar: main protegida, PR required) |
| **Dependabot alerts** | ❌ Não verificado (ativar no GitHub) |
| **Signed commits** | ❌ Não verificado |
| **Build reproducibility** | ✅ `package-lock.json` comitado |
| **Secrets in repo** | ✅ Nenhum (verificado) |

---

### 7. Client-Side Storage (`localStorage`)

| Chave | Conteúdo | Risco |
|-------|----------|-------|
| `jp-tema` | `"light" | "dark"` | Baixo |
| `jp-responsabilidade-aceita` | `"1"` | Baixo |
| `jp-historico` | Array de jogos locais | Baixo (apenas números) |

**Nenhum dado sensível** — apenas preferências e histórico local.

---

## 🛡️ Plano de Ação Priorizado

### 🔴 Crítico (Fazer Agora)
1. **Adicionar CSP + Headers de segurança** via `public/_headers`
2. **Corrigir `innerHTML`** em `index.astro` (progress container)

### 🟠 Alto (Esta Semana)
3. **Atualizar patches**: `biome`, `playwright`, `typescript`, `@astrojs/sitemap`
4. **Ativar Dependabot + CodeQL** no GitHub
5. **Branch protection** na `main` (PR required, status checks)

### 🟡 Médio (Próximo Sprint)
6. **Avaliar upgrade Astro 5+** (breaking changes: API routes, middleware, islands)
7. **Adicionar rate limiting** na API (middleware Astro ou edge function)
8. **Subresource Integrity (SRI)** para fontes externas (Google Fonts)

### 🟢 Baixo (Backlog)
9. **CSP `report-only`** primeiro, depois enforce
10. **Security.txt** (`/.well-known/security.txt`)
11. **Signed commits** + `git commit -S`

---

## 📝 Checklist de Verificação Pós-Deploy

- [ ] CSP header presente em `curl -I https://site.com`
- [ ] `X-Frame-Options: DENY` presente
- [ ] Console sem erros CSP (`Content-Security-Policy` violations)
- [ ] Tema toggle funciona + persiste no reload
- [ ] Progress bar aparece/atualiza ao gerar jogos
- [ ] API `/api/validacao?modalidade=mega-sena` retorna 200 + JSON válido
- [ ] Nenhum erro no console (XSS, mixed content, CORS)

---

## 📊 Conclusão

**Risco geral: BAIXO** para um site estático público sem backend, autenticação ou dados sensíveis.

As vulnerabilidades "críticas" do npm audit **não se aplicam** ao build estático servido no GitHub Pages. As principais melhorias são **defesa em profundidade** (CSP, headers) e **higiene de dependências**.

> **Próximo passo recomendado:** Implementar headers de segurança (`_headers`) + corrigir `innerHTML` + atualizar patches de dependências.