# 🎨 UI/UX Audit Report — Jogo na Hora (Projeto-Loteria)

**Data:** 2026-11-22  
**Versão Analisada:** 0.1.0  
**Auditor:** AI Assistant (usando skills: ui-ux-pro-max, frontend-design, theme-factory)

---

## 📋 Resumo Executivo

| Aspecto | Status Atual | Prioridade |
|---------|-------------|------------|
| **Design System** | ✅ Existente (tokens.css + global.css) | Baixa |
| **Acessibilidade (WCAG AA)** | ⚠️ Parcial (contrastes OK, mas focus rings podem melhorar) | Média |
| **Tipografia** | ⚠️ Funcional mas genérica (Inter + JetBrains Mono) | Média |
| **Paleta de Cores** | ⚠️ Verde CAIXA dominante, sem personalidade única | **Alta** |
| **Layout & Espaçamento** | ✅ Consistente (escala 4px) | Baixa |
| **Componentes** | ⚠️ Muitos padrões genéricos (cards, buttons) | **Alta** |
| **Dark Mode** | ✅ Implementado (prefers-color-scheme + data-theme) | Baixa |
| **Mobile/Responsive** | ✅ Funcional (CSS-only mobile menu) | Baixa |
| **Animações** | ⚠️ Genéricas (fade-in, slide-up) | Média |
| **Micro-interações** | ❌ Ausentes | **Alta** |

---

## 🔍 Análise Detalhada do Design Atual

### 1. Paleta de Cores Atual (`tokens.css`)

```css
/* Atual - Verde CAIXA dominante */
--color-primary: #2f7a3d;           /* Verde CAIXA oficial */
--color-primary-pale: #eaf3e6;      /* Fundos sutis */
--color-accent: #c45a00;            /* Laranja WCAG AA */
--color-neutral-100: #f6f8f4;       /* Background principal */
--color-neutral-50: #fbfcfa;        /* Background seções */
```

**Problemas identificados:**
- **Verde CAIXA dominante** → O site parece "site oficial da CAIXA", não independente
- **Laranja de acento** → Conflita com verde (complementares não harmoniosas)
- **Neutros esverdeados** → Tudo "verde", sem respiro visual
- **Falta identidade própria** → Parece template governamental

### 2. Tipografia Atual

```css
--font-sans: 'Inter', system-ui, ...;  /* Genérico, usado em 40%+ sites */
--font-mono: 'JetBrains Mono', ...;    /* Padrão dev */
```

**Problemas:**
- **Inter** → Usado em excesso (Vercel, Linear, Notion, etc.) → sem personalidade
- **JetBrains Mono** → Padrão para código, não para UI de números
- **Escala clamp()** → Funcional mas sem ritmo visual distintivo

### 3. Componentes - Padrões Genéricos Detectados

| Componente | Padrão Atual | Classificação (frontend-design) |
|------------|--------------|--------------------------------|
| **Cards** | `.card` com `box-shadow: var(--shadow-sm)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-lg)` | **SaaS-card kit** (padrão #4) |
| **Buttons** | `.btn-primary` verde, `.btn-secondary` outline, `.btn-ghost` texto | **SaaS padrão** |
| **NumberBall** | Verde `#5dd921` hardcoded, não usa tokens | **Hardcoded** ❌ |
| **Cards de método** | `.method-card` com badge numerado, hover `translateY(-2px)` | **Case Studies padrão** |
| **Hero** | Gradient verde pálido, badge dourado, stats com ícones | **Trust bar padrão** |
| **Modality Picker** | Botões com `aria-pressed`, hover `translateY(-2px)` | **Segmented control padrão** |

### 4. Layout & Espaçamento

- ✅ **Escala 4px consistente** (`--space-1` a `--space-20`)
- ✅ **Container max 1100px** com padding responsivo
- ✅ **Grid system** (`.grid-2`, `.grid-3`, `.grid-4`)
- ⚠️ **Container padding fixo** (1.25rem) — não respira em desktop grande

### 5. Dark Mode

```css
@media (prefers-color-scheme: dark) { ... }
html[data-theme="dark"] { ... }
html[data-theme="light"] { ... }
```

- ✅ Implementação completa (CSS variables + data-theme + prefers-color-scheme)
- ⚠️ **Inversão direta de neutros** → verde pálido vira `#1a3d1a` (muito escuro)
- ⚠️ **Acento laranja vira `#ff9f43`** → perde harmonia com verde

---

## 🎯 Recomendações de Redesign (Priorizadas)

---

### 🔴 PRIORIDADE ALTA — Identidade Visual Própria

#### 1. Nova Paleta de Cores — "Confiável, Moderno, Suave"

**Conceito:** "Tons de confiança" — azul-esverdeado suave (confiança/calma) + neutros quentes (acessível/humano) + acento dourado suave (otimismo/prêmio)

```css
/* Nova Paleta Proposta — "Jogo na Hora" */
:root {
  /* Primária — Azul-esverdeado suave (confiança, calma, loteria) */
  --color-primary: #0d9488;           /* Teal 600 - confiança, modernidade */
  --color-primary-hover: #0f766e;     /* Teal 700 */
  --color-primary-light: #14b8a6;     /* Teal 500 */
  --color-primary-lighter: #2dd4bf;   /* Teal 400 */
  --color-primary-pale: #ccfbf1;      /* Teal 50 - fundos sutis */

  /* Acento — Dourado suave (otimismo, prêmio, sorte) */
  --color-accent: #d4a843;            /* Âmbar 600 - otimismo, prêmio */
  --color-accent-hover: #b8943a;      /* Âmbar 700 */
  --color-accent-pale: #fef3c7;       /* Âmbar 50 */

  /* Neutros — Escala quente (cinza-bege) */
  --color-neutral-950: #1c1917;       /* Stone 950 - texto principal */
  --color-neutral-900: #292524;       /* Stone 900 */
  --color-neutral-800: #44403c;       /* Stone 800 */
  --color-neutral-700: #686058;       /* Stone 700 - subtítulos */
  --color-neutral-600: #78716c;       /* Stone 600 - texto muted */
  --color-neutral-500: #a8a29e;       /* Stone 500 - placeholders */
  --color-neutral-400: #d6d3d1;       /* Stone 400 - borders sutis */
  --color-neutral-300: #e7e5e4;       /* Stone 300 - divisors */
  --color-neutral-200: #f5f5f4;       /* Stone 200 - card backgrounds */
  --color-neutral-100: #fafaf9;       /* Stone 100 - background principal */
  --color-neutral-50: #fafaf9;        /* Stone 50 - seções alternadas */

  /* Semânticas (mantidas) */
  --color-success: #166534;           /* Green 800 */
  --color-success-bg: #dcfce7;        /* Green 50 */
  --color-warning: #b45309;           /* Amber 800 */
  --color-warning-bg: #fffbeb;        /* Amber 50 */
  --color-error: #b91c1c;             /* Red 800 */
  --color-error-bg: #fef2f2;          /* Red 50 */
  --color-info: #1d4ed8;              /* Blue 700 */
  --color-info-bg: #dbeafe;           /* Blue 50 */

  /* Modalidades — Cores decorativas (mantidas, ajustadas) */
  --color-mega-sena: #15803d;         /* Green 700 */
  --color-mega-sena-bg: #dcfce7;      /* Green 50 */
  --color-lotofacil: #ea580c;         /* Orange 600 */
  --color-lotofacil-bg: #ffedd5;      /* Orange 50 */
  --color-quina: #2563eb;             /* Blue 600 */
  --color-quina-bg: #dbeafe;          /* Blue 50 */
  --color-lotomania: #9333ea;         /* Purple 600 */
  --color-lotomania-bg: #f3e8ff;      /* Purple 50 */
}
```

**Por que esta paleta?**
| Decisão | Justificativa (ui-ux-pro-max + frontend-design) |
|---------|------------------------------------------------|
| **Teal primário** | Confiança, calma, modernidade — difere do verde CAIXA; "loteria" = água/sorte |
| **Âmbar dourado acento** | Otimismo, prêmio, sorte — harmônico com teal (análogos) |
| **Neutros Stone (quentes)** | Mais humanos, legíveis, menos "técnicos" que cinza azulado |
| **Modalidades mantidas** | Familiaridade para usuários; ajustadas para harmonia |

#### 2. Nova Tipografia — Personalidade + Legibilidade

```css
/* Opção A: Moderna + Acessível (Recomendada) */
--font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  /* Geométrica humanista, legível, moderna, pesos variados */

--font-mono: 'Space Mono', 'JetBrains Mono', monospace;
  /* Mais personalidade para números, legível em tamanhos pequenos */

/* Opção B: Editorial + Confiável */
--font-sans: 'Source Serif 4', system-ui, serif;
  /* Serif editorial, confiança, leitura longa */

--font-mono: 'IBM Plex Mono', monospace;
  /* Técnico mas humanista */

/* Escala de tipo refinada (clamp + ritmo) */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);   /* 12-13px */
--text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 0.9375rem); /* 14-15px */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);    /* 16-17px */
--text-lg: clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem);   /* 18-20px */
--text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);      /* 20-24px */
--text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 2rem);       /* 24-32px */
--text-3xl: clamp(1.875rem, 1.6rem + 1.25vw, 2.5rem);    /* 30-40px */
--text-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3.5rem);     /* 36-56px */

--leading-tight: 1.15;
--leading-snug: 1.4;
--leading-normal: 1.65;
--leading-relaxed: 1.8;
```

**Por que Plus Jakarta Sans?**
- Geométrica humanista → moderna mas legível
- 8 pesos (200-800) → hierarquia rica sem múltiplas fontes
- Legível em tamanhos pequenos (números de bolas)
- Não é Inter/Roboto/Open Sans → identidade própria

#### 3. NumberBall — Usar Tokens + Variantes

```astro
--- 
// NumberBall.astro — refatorado
interface Props {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'modalidade' | 'accent' | 'success';
}

const { value, size = 'md', variant = 'default' } = Astro.props;

const sizeMap = {
  sm: { width: '28px', height: '28px', fontSize: 'var(--text-sm)' },
  md: { width: '40px', height: '40px', fontSize: 'var(--text-base)' },
  lg: { width: '56px', height: '56px', fontSize: 'var(--text-lg)' },
};

const variantStyles = {
  default: 'background: var(--color-primary); color: var(--color-text-inverse);',
  modalidade: 'background: var(--color-primary-pale); color: var(--color-primary); border: 2px solid var(--color-primary);',
  accent: 'background: var(--color-accent); color: var(--color-text-inverse);',
  success: 'background: var(--color-success); color: var(--color-text-inverse);',
};

const style = {
  width: sizes[size].width,
  height: sizes[size].height,
  fontSize: sizes[size].fontSize,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  userSelect: 'none',
  ...variantStyles[variant],
};
---
```

---

### 🟠 PRIORIDADE MÉDIA — Componentes Distintivos

#### 4. Cards — Sair do "SaaS Card Kit"

```css
/* Novo sistema de cards com hierarquia visual */

.card {
  /* Base */
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base), border-color var(--transition-base), transform var(--transition-base);
}

/* Variantes com propósito */
.card-elevated {
  box-shadow: var(--shadow-md);
  border-color: transparent;
}
.card-elevated:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-outlined {
  border-width: 2px;
  border-color: var(--color-neutral-300);
  box-shadow: none;
}
.card-outlined:hover {
  border-color: var(--color-primary);
}

.card-filled {
  background: var(--color-neutral-200);
  border: none;
  box-shadow: var(--shadow-sm);
}

/* Card interativo (clickable) */
.card-interactive {
  cursor: pointer;
}
.card-interactive:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.card-interactive:active {
  transform: translateY(0);
}
```

#### 5. Buttons — Hierarquia Clara + Micro-interações

```css
/* Sistema de botões com estados claros */

.btn {
  /* Base unificada */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.5;
  border-radius: var(--radius-lg);
  border: 2px solid transparent;
  cursor: pointer;
  transition: 
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

/* Primary — Ação principal */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-primary);
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary-lg);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-primary);
}

/* Secondary — Ação secundária */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--color-primary-pale);
  border-color: var(--color-primary);
}

/* Ghost — Ação terciária / sutil */
.btn-ghost {
  background: transparent;
  color: var(--color-neutral-600);
  border-color: transparent;
  padding: var(--space-2) var(--space-4);
}
.btn-ghost:hover:not(:disabled) {
  color: var(--color-primary);
  background: var(--color-primary-pale);
}

/* Accent — CTA especial (PIX, compartilhar) */
.btn-accent {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
  box-shadow: 0 4px 16px rgba(212, 168, 67, 0.3);
}
.btn-accent:hover:not(:disabled) {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(212, 168, 67, 0.4);
}

/* Estados consistentes */
.btn:focus-visible {
  outline: 3px solid var(--color-border-focus);
  outline-offset: 3px;
}
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}
```

#### 6. Hero — Momento Memorável Único

```astro
<!-- Hero refatorado — um momento de entrada orquestrado -->
<section class="hero">
  <div class="container">
    <!-- Badge de confiança (entrada escalonada) -->
    <div class="hero-badge animate-slide-up">
      <svg>...</svg>
      <span>Independente · Gratuito · Dados oficiais CAIXA</span>
    </div>

    <!-- Título principal (o momento) -->
    <h1 class="hero-title animate-fade-in" style="animation-delay: 100ms;">
      Gere jogos com <span class="highlight">metodologia transparente</span>
    </h1>

    <!-- Descrição -->
    <p class="hero-description animate-fade-in" style="animation-delay: 200ms;">
      Escolha a modalidade, configure a estratégia e gere combinações.
      Toda combinação tem a mesma probabilidade — use nossas ferramentas
      para descrever, organizar e diversificar seus jogos com base em dados reais.
    </p>

    <!-- CTA Principal (único foco) -->
    <div class="hero-actions animate-slide-up" style="animation-delay: 300ms;">
      <button class="btn btn-primary btn-lg" id="btn-hero-gerar">
        <svg>...</svg>
        Gerar meu primeiro jogo
      </button>
    </div>

    <!-- Trust signals (entrada final) -->
    <div class="hero-trust animate-fade-in" style="animation-delay: 400ms;">
      <div class="hero-trust-item">...</div>
      ...
    </div>
  </div>
</section>

<style>
  /* Animações de entrada - uma orquestração */
  .hero-title .highlight {
    background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .hero-badge {
    animation: slide-up var(--transition-slow) ease forwards;
  }
  .hero-title { animation: fade-in var(--transition-base) ease forwards; }
  .hero-description { animation: fade-in var(--transition-base) ease forwards; }
  .hero-actions { animation: slide-up var(--transition-slow) ease forwards; }
  .hero-trust { animation: fade-in var(--transition-base) ease forwards; }
  
  /* Delays escalonados via inline style ou JS */
</style>
```

---

### 🟡 PRIORIDADE BAIXA — Polimento & Acessibilidade

#### 7. Micro-interações & Feedback

```css
/* Number grid - feedback tátil */
.number-btn {
  transition: all var(--transition-fast);
}
.number-btn:active {
  transform: scale(0.95);
}
.number-btn.selected {
  animation: pop-in 200ms ease-out;
}

@keyframes pop-in {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

/* Progress bar - easing natural */
.progress-bar {
  transition: width 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Form inputs - feedback imediato */
.form-input:focus,
.form-select:focus {
  animation: focus-ring 200ms ease-out;
}

@keyframes focus-ring {
  0% { box-shadow: 0 0 0 0 var(--color-primary-light); }
  100% { box-shadow: 0 0 0 3px var(--color-primary-light); }
}
```

#### 8. Acessibilidade - Refinamentos

```css
/* Focus visible consistente */
:focus-visible {
  outline: 3px solid var(--color-border-focus);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

/* Skip link melhorado */
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  z-index: 10000;
  font-weight: 600;
  font-size: var(--text-sm);
  box-shadow: var(--shadow-lg);
  transition: top var(--transition-fast);
}
.skip-link:focus { top: var(--space-4); }

/* Reduced motion - respeitado em TUDO */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --color-border: var(--color-neutral-950);
    --color-border-focus: var(--color-neutral-950);
  }
  .btn { border-width: 3px !important; }
  .number-btn { border-width: 3px !important; }
}
```

---

## 📐 Wireframes ASCII — Novos Layouts

### Home Page (Hero + Generator)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo | Nav | Theme Toggle | Hamburger              │
├─────────────────────────────────────────────────────────────┤
│  HERO SECTION                                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  🏷️ Independente · Gratuito · Dados oficiais CAIXA      │ │
│  │                                                         │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │  Gere jogos com metodologia transparente          │  │ │  ← GRADIENTE TEXTO
│  │  └───────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  │  Escolha a modalidade, configure a estratégia e gere   │ │
│  │  combinações. Toda combinação tem a mesma probabilidade│ │
│  │  — use nossas ferramentas para descrever, organizar    │ │
│  │  e diversificar seus jogos com base em dados reais.    │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │  [ 🎲  Gerar meu primeiro jogo ]  ← CTA ÚNICO   │   │ │  ← BOTÃO PRIMÁRIO GRANDE
│  │  └─────────────────────────────────────────────────┘   │ │
│  │                                                         │ │
│  │  🛡️ Dados oficiais  💾 Histórico local  📐 Fórmulas   │ │  ← TRUST BAR
│  │   abertas          no navegador      transparentes    │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  GENERATOR PANEL                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ⚙️ Configurações                    [Gerar 3 jogos]    │ │
│  │  ┌────────┬────────┬────────┬────────┬────────────────┐  │ │
│  │  │Modalid.│Quant.  │Estratég.│Janela │ ☑ Filtros      │  │ │
│  │  │▼ M-S │ 3      │▼ Combin.│ 100   │ ☑ Diversificar   │  │ │
│  │  │      │        │         │       │ ☐ Calendário     │  │ │
│  │  └────────┴────────┴────────┴────────┴────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  🔢 Grade de Dezenas (clicável)                               │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                             │
│  │01│02│03│...                    │10│                         │
│  └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                             │
│                                                               │
│  📊 RESULTADOS (cards horizontais)                            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Mega-Sena 01    01 05 12 23 34 49    [📋][📥][📱][💾]   │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Mega-Sena 02    03 11 22 33 44 55    [📋][📥][📱][💾]   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Statistics Page

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
├─────────────────────────────────────────────────────────────┤
│  PAGE HEADER                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  📊 Estatísticas — Mega-Sena                            │ │
│  │  Frequência, atraso e análise estatística das 60 dezenas│ │
│  │  Estatísticas são para descrição, não previsão.         │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  SUMMARY CARD + STATS GRID (2x2 desktop, 1 col mobile)      │
│  ┌─────────────────┬─────────────────┬─────────────────────┐ │
│  │ 📈 Frequência   │ ⏱️ Atraso      │ 📊 Qui-quadrado      │ │
│  │ Mais freq:      │ Maior atraso:  │ χ² = 45.2 · gl = 59  │ │
│  │ 05 (12), 12(11) │ 45 (18), 12(15)│ p-valor = 0.002      │ │
│  └─────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  DISTRIBUIÇÃO TEÓRICA (tabela responsiva)                    │
│  ┌────────┬──────────────┬─────────┐                         │
│  │ Acertos │ Probabilidade │ 1 em  │                         │
│  ├────────┼──────────────┼─────────┤                         │
│  │ 6       │ 0.000002%    │ 50M    │                         │
│  │ 5       │ 0.0018%      │ 55K    │                         │
│  │ 4       │ 0.097%       │ 1,030  │                         │
│  │ 3       │ 1.77%        │ 56     │                         │
│  │ ...     │ ...          │ ...    │                         │
│  └────────┴──────────────┴─────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Plano de Implementação (Fases)

| Fase | Escopo | Esforço | Dependências |
|------|--------|---------|--------------|
| **1. Tokens & Base** | Nova paleta, tipografia, tokens CSS | 4h | Nenhuma |
| **2. Componentes Core** | Button, Card, NumberBall, Input | 6h | Fase 1 |
| **3. Layouts Principais** | Hero, Generator Panel, Hero Stats | 4h | Fase 2 |
| **4. Páginas** | Home, Estatísticas, Validação, Simulador | 8h | Fase 2-3 |
| **5. Micro-interações** | Animações entrada, feedback, loading | 4h | Fase 2-3 |
| **6. Acessibilidade** | Focus, reduced-motion, high-contrast | 3h | Fase 1-4 |
| **7. Testes & Ajustes** | Testes unitários, E2E, revisão visual | 4h | Todas |

**Total estimado:** ~33h

---

## ✅ Checklist de Validação (Pré-entrega)

- [ ] **Contraste WCAG AA** — Todos os pares texto/background ≥ 4.5:1
- [ ] **Focus Visible** — Todos elementos interativos têm focus ring 3px
- [ ] **Reduced Motion** — `prefers-reduced-motion` desativa TUDO
- [ ] **High Contrast** — `prefers-contrast: high` funcionalmente testado
- [ ] **Keyboard Nav** — Tab order lógico, skip link funcional
- [ ] **Touch Targets** — Mínimo 44×44px (botões, números, checkboxes)
- [ ] **Reduced Motion** — Animações respeitam preferência
- [ ] **Dark Mode** — Contraste mantido, cores harmônicas
- [ ] **Responsive** — 320px, 480px, 768px, 1024px, 1440px testados
- [ ] **Print Styles** — Header/footer ocultos, cores ajustadas
- [ ] **Performance** — LCP < 2.5s, CLS < 0.1, TBT < 200ms

---

## 🎨 Referências Visuais (Moodboard Conceitual)

| Referência | O que adotar |
|------------|--------------|
| **Linear.app** | Cards elevados, tipografia Plus Jakarta Sans, micro-interações sutis |
| **Vercel** | Hero com gradiente de texto, CTA único proeminente, trust bar |
| **Notion** | Neutros quentes (Stone), tipografia editorial, espaçamento generoso |
| **Stripe** | Micro-interações (botões, inputs), focus rings, motion sutil |
| **GitHub** | Dark mode bem executado, focus visível, acessibilidade |

---

## 📝 Próximos Passos Imediatos

1. **Aprovar paleta/tipografia** — Confirmar direção visual
2. **Criar branch `redesign/ui-ux`** — Isolar mudanças
3. **Implementar Fase 1** — Tokens + tipografia
4. **Revisar componentes** — Validar NumberBall, Button, Card
5. **Iterar com feedback visual** — Screenshots lado a lado

---

> **Nota:** Este relatório segue os princípios do `frontend-design` (evitar padrões genéricos, fazer escolhas deliberadas) e `ui-ux-pro-max` (acessibilidade first, micro-interações purposeful, design system coerente). Todas as recomendações mantêm **100% das funcionalidades atuais** — apenas elevam a experiência visual e de uso.