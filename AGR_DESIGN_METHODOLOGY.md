# Aplicando Metodologias de Design do AGR Studio ao Projeto Loteria

> Análise e plano de implementação baseado no estudo de caso do [agr.studio](https://agr.studio/)

---

## 1. Resumo Executivo

O AGR Studio demonstra padrões de design de **alto nível para B2B** que podem ser adaptados para um produto B2C como o Jogo na Hora. A chave é traduzir "serviços de brand/web" em "ferramentas de loteria transparentes".

### Princípios Centrais do AGR para Aplicar

| Princípio AGR | Adaptação para Jogo na Hora |
|--------------|----------------------------|
| **Value prop clara no hero** | "Gere combinações com metodologia transparente, dados reais, sem promessas falsas" |
| **Social proof (logos, reviews, ratings)** | Stats de uso, transparência metodológica, badges de fonte de dados (CAIXA), "100% gratuito" |
| **Case studies detalhados** | Páginas de metodologia (E1–E4) com exemplos, limitações, fórmulas |
| **Processo transparente (4 steps)** | "Como funciona: Escolha → Configure → Gere → Entenda" |
| **Founder-led, no junior handoffs** | "Criado por [nome] — engenheiro/dados — sem equipe júnior, código aberto" |
| **AI-ready (llms.txt, .md pages)** | Já implementado parcialmente — expandir |
| **Múltiplos CTAs estratégicos** | "Gerar agora", "Ver metodologia", "Ver estatísticas", "Como funciona" |
| **Especialização setorial** | Foco: loterias CAIXA, probabilidade, educação estatística |
| **Performance & SEO técnico** | Astro + CSS puro = base sólida, otimizar CWV |
| **Trust signals no footer** | Links legais, contato, versão, data de atualização dos dados |

---

## 2. Análise Comparativa: AGR vs Jogo na Hora Atual

### O que o AGR faz bem (e como aplicar)

| Elemento AGR | Status Atual | Ação Recomendada |
|-------------|--------------|------------------|
| **Hero com badge de confiança** | ✅ Tem "Site independente • Gratuito • Sem apostas" | **Manter e destacar** — mover para cima, tornar mais visual |
| **Headline forte + subheadline** | ✅ "Sorteie sua combinação" | **Refinar** — tornar mais orientada a benefício: "Gere jogos com metodologia transparente baseada em dados reais da CAIXA" |
| **CTA primário + secundário** | ✅ "Sortear agora" + "Como funciona" | **Manter** — garantir hierarquia visual clara |
| **Seletor de modalidade visual** | ✅ 4 botões com meta (preço, qtd dezenas) | **Melhorar** — cards estilo AGR com ícones, hover states, estado ativo claro |
| **Grid de benefícios (3 colunas)** | ✅ 3 cards: Probabilidade, Histórico, Fórmulas | **Redesenhar** — estilo AGR: card com ícone, título, descrição, hover sutil |
| **Depoimentos/case studies** | ❌ Ausente | **Criar** — "Metodologias em ação" com exemplos reais de cada estratégia |
| **Processo em 4 passos** | ❌ Ausente | **Criar** — "Como funciona em 4 passos" visual |
| **Founder story** | ⚠️ Página /sobre básica | **Expandir** — missão pessoal, por que criou, transparência |
| **Serviços/Features detalhados** | ⚠️ Espalhados | **Consolidar** — página "Ferramentas" ou seção com cards detalhados |
| **Footer abrangente** | ⚠️ Básico | **Expandir** — estilo AGR: Solutions, Studio, Legal, Social |
| **Sticky header com active state** | ✅ Tem | **Refinar** — mais limpo, logo mais forte |
| **Tipografia de sistema** | ✅ Segoe UI | **Manter** — mas ajustar escala, peso, line-height estilo AGR |
| **Variáveis CSS organizadas** | ✅ Bem estruturado | **Expandir** — design tokens completos (spacing, shadows, radius, transitions) |

---

## 3. Design Tokens Inspirados no AGR

### Paleta de Cores (Refinada)

```css
:root {
  /* Primária - Verde AGR inspirado, mais sofisticado */
  --color-primary: #1f5e0d;           /* Verde escuro principal (AGR usa #2f7a12) */
  --color-primary-light: #2f7a12;     /* Hover/active */
  --color-primary-lighter: #4bc418;   /* Botões, accents */
  --color-primary-pale: #e8ffe0;      /* Backgrounds sutis, badges */
  
  /* Neutros - Escala cinza quente estilo AGR */
  --color-neutral-950: #0f140d;       /* Texto principal */
  --color-neutral-900: #152012;       /* Headlines */
  --color-neutral-700: #2d3d26;       /* Subtítulos */
  --color-neutral-600: #4b5a43;       /* Texto secundário (muted) */
  --color-neutral-400: #8a9a83;       /* Placeholders, borders sutis */
  --color-neutral-300: #d8e6d2;       /* Borders, divisors */
  --color-neutral-200: #eef3ec;       /* Backgrounds de cards */
  --color-neutral-100: #f7faf5;       /* Background principal */
  --color-neutral-50: #fafcf9;        /* Background seções alternadas */
  --color-white: #ffffff;
  
  /* Semânticas */
  --color-success: #2f7a12;
  --color-warning: #e65100;
  --color-warning-bg: #fff8e1;
  --color-warning-border: #ffe082;
  --color-error: #c62828;
  --color-error-bg: #fdeaea;
  --color-info: #1565c0;
  --color-info-bg: #e3f2fd;
  
  /* WhatsApp */
  --color-whatsapp: #25d366;
  --color-whatsapp-hover: #1ebe5d;
  
  /* Lotomania (azul diferenciado) */
  --color-lotomania: #1e88e5;
  --color-lotomania-bg: #e3f2fd;
}

/* Dark mode (opcional, futuro) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-neutral-950: #f7faf5;
    --color-neutral-900: #eef3ec;
    --color-neutral-100: #152012;
    --color-neutral-50: #0f140d;
    --color-primary-pale: #1a3d12;
  }
}
```

### Espaçamento (Escala 4px base)

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### Tipografia (Escala fluida)

```css
:root {
  /* Fontes */
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Escala fluida (clamp) */
  --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
  --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
  --text-base: clamp(0.95rem, 0.9rem + 0.25vw, 1rem);
  --text-lg: clamp(1.05rem, 1rem + 0.25vw, 1.125rem);
  --text-xl: clamp(1.2rem, 1.1rem + 0.5vw, 1.375rem);
  --text-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);
  --text-3xl: clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1.8rem + 2vw, 3.5rem);
  
  /* Pesos */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* Line heights */
  --leading-tight: 1.1;
  --leading-snug: 1.35;
  --leading-normal: 1.6;
  --leading-relaxed: 1.75;
}
```

### Sombras e Bordas

```css
:root {
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;
  
  --shadow-xs: 0 1px 2px rgba(15, 20, 13, 0.05);
  --shadow-sm: 0 1px 3px rgba(15, 20, 13, 0.08), 0 1px 2px rgba(15, 20, 13, 0.06);
  --shadow-md: 0 4px 6px rgba(15, 20, 13, 0.07), 0 2px 4px rgba(15, 20, 13, 0.06);
  --shadow-lg: 0 10px 15px rgba(15, 20, 13, 0.1), 0 4px 6px rgba(15, 20, 13, 0.05);
  --shadow-xl: 0 20px 25px rgba(15, 20, 13, 0.15), 0 10px 10px rgba(15, 20, 13, 0.04);
  
  --shadow-primary: 0 4px 16px rgba(47, 122, 18, 0.15);
  --shadow-primary-lg: 0 8px 24px rgba(47, 122, 18, 0.2);
}
```

### Transições

```css
:root {
  --transition-fast: 100ms ease;
  --transition-base: 150ms ease;
  --transition-slow: 250ms ease;
}
```

---

## 4. Componentes AGR-Style para Implementar

### 4.1 Hero Section (Refinada)

```astro
<!-- Hero AGR-style -->
<section class="hero" aria-labelledby="hero-title">
  <div class="container">
    <div class="hero-content">
      <!-- Trust badge estilo AGR -->
      <span class="hero-badge" aria-hidden="true">
        <svg class="badge-icon" aria-hidden="true">...</svg>
        Site independente · Gratuito · Sem apostas · Dados oficiais CAIXA
      </span>
      
      <!-- Headline forte -->
      <h1 id="hero-title" class="hero-title">
        Gere jogos com <span class="highlight">metodologia transparente</span>
      </h1>
      
      <!-- Subheadline orientada a benefício -->
      <p class="hero-description">
        Escolha a modalidade, configure a estratégia e gere combinações.
        Toda combinação tem a mesma probabilidade — use nossas ferramentas
        para descrever, organizar e diversificar seus jogos com base em dados reais.
      </p>
      
      <!-- CTAs primário + secundário -->
      <div class="hero-actions">
        <button id="btn-sorteio-hero" class="btn btn-primary btn-lg" aria-label="Gerar uma combinação rápida">
          <svg aria-hidden="true">...</svg>
          Gerar jogo agora
        </button>
        <a href="/como-funciona" class="btn btn-secondary btn-lg">Como funciona</a>
      </div>
      
      <!-- Modalidade picker como cards visuais -->
      <nav class="modality-picker" aria-label="Escolha a modalidade" role="group">
        <button class="modality-card" data-modalidade="mega-sena" aria-pressed="true">
          <span class="modality-icon" aria-hidden="true">🏆</span>
          <span class="modality-label">Mega-Sena</span>
          <span class="modality-meta">6 dezenas · R$ 6,00</span>
        </button>
        <!-- ... demais modalidades -->
      </nav>
      
      <!-- Trust stats -->
      <div class="hero-stats" aria-label="Estatísticas do site">
        <div class="stat-item">
          <div class="stat-value" id="stat-concursos">—</div>
          <div class="stat-label">Concursos analisados</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">4</div>
          <div class="stat-label">Modalidades</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">100%</div>
          <div class="stat-label">Gratuito</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="stat-atualizado">—</div>
          <div class="stat-label">Última atualização</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 4.2 Feature Grid (Cards estilo AGR)

```astro
<!-- Grid de features/ferramentas -->
<section class="section" aria-labelledby="features-title">
  <div class="container">
    <header class="section-header">
      <h2 id="features-title">Ferramentas e análises disponíveis</h2>
      <p>Cada ferramenta tem metodologia documentada e limitações claras.</p>
    </header>
    
    <div class="grid grid-3">
      <article class="feature-card card">
        <div class="feature-icon" aria-hidden="true">
          <svg>...</svg>
        </div>
        <h3 class="feature-title">Probabilidade Real</h3>
        <p class="feature-description">Toda combinação válida tem exatamente a mesma chance. Nenhum método altera as odds.</p>
        <a href="/probabilidade" class="feature-link">Ver detalhes <svg>→</svg></a>
      </article>
      
      <article class="feature-card card">
        <div class="feature-icon" aria-hidden="true">
          <svg>...</svg>
        </div>
        <h3 class="feature-title">Histórico Local</h3>
        <p class="feature-description">Seus jogos ficam salvos no navegador com cópia, compartilhamento e exportação.</p>
        <a href="/como-funciona#historico" class="feature-link">Ver detalhes <svg>→</svg></a>
      </article>
      
      <article class="feature-card card">
        <div class="feature-icon" aria-hidden="true">
          <svg>...</svg>
        </div>
        <h3 class="feature-title">Fórmulas Documentadas (F1–F13)</h3>
        <p class="feature-description">Métricas calculadas a partir dos dados reais da CAIXA, com metodologia aberta.</p>
        <a href="/metodologia" class="feature-link">Ver detalhes <svg>→</svg></a>
      </article>
      
      <!-- Mais cards... -->
    </div>
  </div>
</section>
```

### 4.3 Process Steps (Como funciona em 4 passos)

```astro
<!-- Process estilo AGR -->
<section class="section section-process" aria-labelledby="process-title">
  <div class="container">
    <header class="section-header">
      <h2 id="process-title">Como funciona em 4 passos</h2>
      <p>Simples, transparente, sem cadastro.</p>
    </header>
    
    <ol class="process-steps">
      <li class="process-step">
        <span class="step-number">01</span>
        <div class="step-content">
          <h3>Escolha a modalidade</h3>
          <p>Mega-Sena, Lotofácil, Quina ou Lotomania. Cada uma com suas regras e probabilidades.</p>
        </div>
      </li>
      <li class="process-step">
        <span class="step-number">02</span>
        <div class="step-content">
          <h3>Configure a estratégia</h3>
          <p>Selecione quantidade (1–10), estratégia (E0–E4), filtros de equilíbrio, janela de análise.</p>
        </div>
      </li>
      <li class="process-step">
        <span class="step-number">03</span>
        <div class="step-content">
          <h3>Gere as combinações</h3>
          <p>Resultados com dezenas legíveis, resumo do método usado, taxa de aceitação dos filtros.</p>
        </div>
      </li>
      <li class="process-step">
        <span class="step-number">04</span>
        <div class="step-content">
          <h3>Entenda e use com responsabilidade</h3>
          <p>Copie, compartilhe, salve no histórico. Lembre-se: toda combinação tem a mesma probabilidade.</p>
        </div>
      </li>
    </ol>
  </div>
</section>
```

### 4.4 Methodology "Case Studies" (Metodologias em Ação)

```astro
<!-- Equivalente a case studies do AGR -->
<section class="section" aria-labelledby="methods-title">
  <div class="container">
    <header class="section-header">
      <h2 id="methods-title">Estratégias de geração (E0–E4)</h2>
      <p>Cada estratégia serve a um propósito descritivo/organizacional — nenhuma aumenta a chance de ganhar.</p>
    </header>
    
    <div class="grid grid-2">
      <article class="method-card card">
        <header class="method-header">
          <span class="method-badge">E0</span>
          <h3>Uniforme (Padrão)</h3>
        </header>
        <p class="method-description">Seleção completamente aleatória, cada dezena tem a mesma probabilidade. Base para comparação.</p>
        <ul class="method-details">
          <li>Uso: Referência, baseline</li>
          <li>Viés: Nenhum</li>
          <li>Indicado: Qualquer situação</li>
        </ul>
        <a href="/metodologia#e0" class="method-link">Ver fórmula e exemplos</a>
      </article>
      
      <article class="method-card card">
        <header class="method-header">
          <span class="method-badge">E1</span>
          <h3>Mais Frequentes</h3>
        </header>
        <p class="method-description">Prioriza dezenas que mais saíram na janela selecionada. Descritivo — não preditivo.</p>
        <ul class="method-details">
          <li>Uso: Ver dezenas "quentes" históricas</li>
          <li>Viés: Frequência passada</li>
          <li>Limitação: Não prevê futuras</li>
        </ul>
        <a href="/metodologia#e1" class="method-link">Ver fórmula e exemplos</a>
      </article>
      
      <!-- E2, E3, E4, Combinado... -->
    </div>
  </div>
</section>
```

### 4.5 Trust Signals / Social Proof Section

```astro
<!-- Sinais de confiança estilo AGR -->
<section class="section section-trust" aria-labelledby="trust-title">
  <div class="container">
    <header class="section-header">
      <h2 id="trust-title">Transparência e confiança</h2>
      <p>Não prometemos ganhos. Prometemos clareza.</p>
    </header>
    
    <div class="trust-grid">
      <div class="trust-item">
        <div class="trust-icon" aria-hidden="true">
          <svg>📊</svg>
        </div>
        <h3>Dados Oficiais CAIXA</h3>
        <p>Resultados importados diretamente das fontes oficiais, com data de atualização visível.</p>
      </div>
      
      <div class="trust-item">
        <div class="trust-icon" aria-hidden="true">
          <svg>🔍</svg>
        </div>
        <h3>Metodologia Aberta</h3>
        <p>Todas as fórmulas (F1–F13), estratégias (E0–E4) e filtros documentados com limitações.</p>
      </div>
      
      <div class="trust-item">
        <div class="trust-icon" aria-hidden="true">
          <svg>🔒</svg>
        </div>
        <h3>Privacidade Real</h3>
        <p>Zero coleta de dados pessoais. Histórico fica só no seu navegador. Sem cookies de rastreamento.</p>
      </div>
      
      <div class="trust-item">
        <div class="trust-icon" aria-hidden="true">
          <svg>⚡</svg>
        </div>
        <h3>Performance</h3>
        <p>Astro + CSS puro = carregamento instantâneo. Funciona offline (PWA básico).</p>
      </div>
      
      <div class="trust-item">
        <div class="trust-icon" aria-hidden="true">
          <svg>🧮</svg>
        </div>
        <h3>Código Aberto</h3>
        <p>Lógica de geração e regras auditáveis. Qualquer um pode verificar a implementação.</p>
      </div>
      
      <div class="trust-item">
        <div class="trust-icon" aria-hidden="true">
          <svg>📅</svg>
        </div>
        <h3>Atualizações Regulares</h3>
        <p id="last-update">Dados atualizados em <span id="update-date">—</span></p>
      </div>
    </div>
  </div>
</section>
```

### 4.6 Footer Estilo AGR

```astro
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <!-- Coluna 1: Brand + Mission -->
      <div class="footer-brand">
        <a href="/" class="footer-logo">Jogo na Hora</a>
        <p class="footer-tagline">Geração de combinações de loteria com metodologia transparente e dados reais.</p>
        <div class="footer-social">
          <a href="https://github.com/seu-usuario/jogo-na-hora" aria-label="GitHub">GitHub</a>
          <a href="mailto:contato@jogonahora.com" aria-label="Email">Email</a>
        </div>
      </div>
      
      <!-- Coluna 2: Ferramentas (Solutions) -->
      <nav class="footer-nav" aria-label="Ferramentas">
        <h4>Ferramentas</h4>
        <ul>
          <li><a href="/">Gerador de Jogos</a></li>
          <li><a href="/estatisticas">Estatísticas</a></li>
          <li><a href="/probabilidade">Probabilidade</a></li>
          <li><a href="/metodologia">Metodologias (E0–E4)</a></li>
          <li><a href="/dados">Dados Históricos</a></li>
        </ul>
      </nav>
      
      <!-- Coluna 3: Studio/Empresa (About) -->
      <nav class="footer-nav" aria-label="Sobre o projeto">
        <h4>Projeto</h4>
        <ul>
          <li><a href="/sobre">Sobre nós</a></li>
          <li><a href="/como-funciona">Como funciona</a></li>
          <li><a href="/faq">Perguntas frequentes</a></li>
          <li><a href="/changelog">Atualizações</a></li>
          <li><a href="/contato">Contato / Reportar erro</a></li>
        </ul>
      </nav>
      
      <!-- Coluna 4: Legal -->
      <nav class="footer-nav" aria-label="Informações legais">
        <h4>Legal</h4>
        <ul>
          <li><a href="/termos">Termos de Uso</a></li>
          <li><a href="/privacidade">Política de Privacidade</a></li>
          <li><a href="/cookies">Política de Cookies</a></li>
          <li><a href="/acessibilidade">Declaração de Acessibilidade</a></li>
          <li><a href="/llms.txt">Para IAs (llms.txt)</a></li>
        </ul>
      </nav>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; {new Date().getFullYear()} Jogo na Hora. Site independente de estudo e diversão sobre loterias da CAIXA.</p>
      <p>Sem vínculo, afiliação ou endosso da Caixa Econômica Federal. Jogo responsável. Público adulto (18+).</p>
      <p>Resultados válidos são sempre os divulgados pela CAIXA.</p>
    </div>
  </div>
</footer>
```

---

## 5. Páginas Prioritárias para Redesign

### Fase 1: Core (Alto impacto, baixo esforço)

| Página | Mudanças Principais |
|--------|---------------------|
| **`/` (Home)** | Hero refinada, feature cards AGR-style, trust signals, process steps, footer expandido |
| **`/como-funciona`** | Process steps visual, FAQ integrado, screenshots/mockups das telas |
| **`/metodologia`** (nova) | Case studies das estratégias E0–E4, fórmulas F1–F13, exemplos, limitações |
| **`/estatisticas`** | Layout de cards, filtros melhorados, visualizações mais limpas |

### Fase 2: Confiança e Conversão

| Página | Mudanças Principais |
|--------|---------------------|
| **`/sobre`** | Founder story, missão, por que criou, transparência técnica |
| **`/probabilidade`** | Explicação visual da matemática, calculadora interativa |
| **`/dados`** | Fonte, frequência de atualização, validação, amostras |
| **Header/Footer globais** | Design tokens aplicados, active states, responsividade |

### Fase 3: Polimento

| Item | Descrição |
|------|-----------|
| **Design System** | Documentar tokens, componentes, padrões em `/design-system` |
| **PWA** | Manifest, service worker básico, ícones |
| **llms.txt expandido** | Fact sheet completo para IAs |
| **Analytics ético** | Plausible/Umami sem cookies, eventos chave apenas |

---

## 6. Plano de Implementação (Tarefas Pequenas)

### Sprint 1: Design Tokens + Hero + Feature Grid
- [ ] Criar `/src/styles/tokens.css` com design tokens AGR-style
- [ ] Refatorar `global.css` para usar tokens
- [ ] Redesenhar Hero em `index.astro` (badge, headline, CTAs, modality cards, stats)
- [ ] Criar componente `FeatureCard.astro` reutilizável
- [ ] Substituir grid de benefícios por Feature Cards
- [ ] Testes: responsividade, acessibilidade, contraste

### Sprint 2: Process Steps + Trust Signals
- [ ] Criar componente `ProcessStep.astro`
- [ ] Adicionar seção "Como funciona em 4 passos" no index
- [ ] Criar seção "Transparência e confiança" (trust grid)
- [ ] Atualizar stats do hero com data de última atualização real
- [ ] Testes: navegação por teclado, screen readers

### Sprint 3: Metodologia (Case Studies)
- [ ] Criar página `/metodologia` (nova rota)
- [ ] Cards para E0, E1, E2, E3, E4, Combinado
- [ ] Cada card linka para seção detalhada com fórmula, exemplo, limitação
- [ ] Adicionar no nav header e footer
- [ ] Testes: conteúdo técnico correto, links funcionando

### Sprint 4: Footer + Header + About
- [ ] Redesenhar Footer estilo AGR (4 colunas)
- [ ] Refinar Header: logo mais forte, active state claro, mobile menu
- [ ] Expandir `/sobre` com founder story, missão, stack técnico
- [ ] Adicionar `/faq` se não existir
- [ ] Testes: todos os links, responsivo, acessibilidade

### Sprint 5: Polimento + PWA + llms.txt
- [ ] Aplicar tokens em todas as páginas restantes
- [ ] Criar `manifest.json`, `sw.js` básico
- [ ] Expandir `llms.txt` com fact sheet completo
- [ ] Auditoria Core Web Vitals, acessibilidade (axe), SEO
- [ ] Documentar design system em `/DESIGN_SYSTEM.md`

---

## 7. Critérios de Aceite por Sprint

### Sprint 1
- [ ] Hero carrega em < 1.5s (LCP)
- [ ] Contraste ≥ 4.5:1 em todos os textos
- [ ] Navegação por teclado funcional em todo hero
- [ ] Modalidade cards: hover, focus, active states visuais
- [ ] Feature cards: hover sutil (translateY(-2px) + shadow)

### Sprint 2
- [ ] Process steps: numeração clara, ícones/ilustrações
- [ ] Trust grid: 6 itens, ícones SVG, layout responsivo (3/2/1 colunas)
- [ ] Stats do hero: contagem real de concursos, data real de atualização

### Sprint 3
- [ ] Página `/metodologia` indexável, meta tags completas
- [ ] Cada estratégia: badge, título, descrição, 3 bullets, link "Ver mais"
- [ ] Páginas de detalhe por estratégia (ou seções com anchor links)

### Sprint 4
- [ ] Footer: 4 colunas desktop, stack mobile, todos os links funcionando
- [ ] Header: logo SVG, active state (aria-current), menu mobile acessível
- [ ] `/sobre`: foto/avatar do criador, texto pessoal, stack, contato

### Sprint 5
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90
- [ ] PWA: instalável, ícone 192/512, manifest válido
- [ ] `llms.txt`: fact sheet, links para páginas .md, reviews/contato

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Mudança visual confunde usuários existentes** | Média | Médio | Manter funcionalidades idênticas; mudança só visual; A/B se possível |
| **Contraste insuficiente com novo verde escuro** | Baixa | Alto | Testar com ferramentas (axe, WCAG); ajustar tokens se necessário |
| **Performance degrada com novos componentes** | Baixa | Médio | Astro otimiza por padrão; monitorar bundle size; lazy-load imagens |
| **Conteúdo técnico (metodologia) fica denso demais** | Média | Médio | Usar progressive disclosure: resumo + "Ver detalhes"; exemplos visuais |
| **Footer muito grande em mobile** | Média | Baixo | Accordion/colapso em mobile; priorizar links essenciais |

---

## 9. Próximos Passos Imediatos

1. **Criar `tokens.css`** com design tokens definidos na seção 3
2. **Refatorar `global.css`** para importar e usar tokens
3. **Redesenhar Hero** no `index.astro` aplicando padrão AGR
4. **Criar `FeatureCard.astro`** componente reutilizável
5. **Substituir grid de benefícios** por Feature Cards

---

## 10. Referências e Inspirações

- **AGR Studio**: https://agr.studio/ (fonte primária)
- **AGR llms.txt**: https://agr.studio/llms.txt (estrutura para IAs)
- **Contra Reviews**: https://contra.com/artyumgr (modelo de social proof)
- **Clutch Profile**: https://clutch.co/profile/agr-studio-0 (case studies B2B)
- **Framer Experts**: https://www.framer.com/@agrstudio/ (showcase técnico)

---

*Documento criado em 30/10/2026 — Baseado na análise do AGR Studio e no código atual do Jogo na Hora (Astro + CSS puro + TypeScript).*