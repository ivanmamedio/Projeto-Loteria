# Comprehensive CSS patch for global.css - applies all Phase 2 + Phase 3 changes

$content = Get-Content "src/styles/global.css" -Raw

# ============================================================================
# PATCH 1: Buttons System (Teal primary + Amber accent)
# ============================================================================
$oldButtons = @'
/* --------------------------------------------------------------------------
   Buttons — Sistema Unificado
   -------------------------------------------------------------------------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-family: inherit; font-size: var(--text-base); font-weight: 600;
  line-height: 1; border-radius: var(--radius-md);
  border: 2px solid transparent; cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none; white-space: nowrap;
}

@media (max-width: 480px) {
  .btn { white-space: normal; padding: var(--space-3) var(--space-4); }
  .btn-sm { padding: var(--space-2) var(--space-3); }
  .btn-lg { padding: var(--space-3) var(--space-5); }
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.btn:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }

/* Primary — Verde Caixa */
.btn-primary {
  background: var(--color-primary); color: var(--color-text-inverse);
  border-color: var(--color-primary);
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); border-color: var(--color-primary-hover); text-decoration: none; }

/* Secondary — Outline neutro */
.btn-secondary {
  background: transparent; color: var(--color-text);
  border-color: var(--color-border);
}
.btn-secondary:hover:not(:disabled) { background: var(--color-bg-muted); border-color: var(--color-border); text-decoration: none; }

/* Ghost — Texto apenas */
.btn-ghost {
  background: transparent; color: var(--color-text-muted);
  border-color: transparent; padding: var(--space-2) var(--space-3);
}
.btn-ghost:hover:not(:disabled) { color: var(--color-text); background: var(--color-bg-muted); text-decoration: none; }

/* Success — Para ações positivas (PIX, etc) */
.btn-success {
  background: var(--color-success); color: var(--color-text-inverse);
  border-color: var(--color-success);
}
.btn-success:hover:not(:disabled) { background: #00642A; border-color: #00642A; text-decoration: none; }

/* Sizes */
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-lg); }
.btn-xl { padding: var(--space-5) var(--space-10); font-size: var(--text-xl); }

/* Full width */
.btn-block { width: 100%; }

/* With icon */
.btn svg { width: 20px; height: 20px; flex-shrink: 0; }
.btn-sm svg { width: 16px; height: 16px; }
.btn-lg svg { width: 24px; height: 24px; }
'@

$newButtons = @'
/* --------------------------------------------------------------------------
   Buttons — Sistema Unificado (Teal primary + Amber accent)
   -------------------------------------------------------------------------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-family: inherit; font-size: var(--text-sm); font-weight: 600;
  line-height: 1.5; border-radius: var(--radius-lg);
  border: 2px solid transparent; cursor: pointer;
  transition: 
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
  text-decoration: none; white-space: nowrap;
}

@media (max-width: 480px) {
  .btn { white-space: normal; padding: var(--space-3) var(--space-4); }
  .btn-sm { padding: var(--space-2) var(--space-3); }
  .btn-lg { padding: var(--space-3) var(--space-5); }
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; transform: none !important; }
.btn:focus-visible { outline: 3px solid var(--color-border-focus); outline-offset: 3px; border-radius: var(--radius-sm); }

/* Primary — Ação principal (Teal) */
.btn-primary {
  background: var(--color-primary); color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-primary);
}
.btn-primary:hover:not(:disabled) { 
  background: var(--color-primary-hover); 
  border-color: var(--color-primary-hover); 
  transform: translateY(-1px); 
  box-shadow: var(--shadow-primary-lg); 
  text-decoration: none; 
}
.btn-primary:active:not(:disabled) { 
  transform: translateY(0); 
  box-shadow: var(--shadow-primary); 
}

/* Secondary — Ação secundária */
.btn-secondary {
  background: transparent; color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn-secondary:hover:not(:disabled) { 
  background: var(--color-primary-pale); 
  border-color: var(--color-primary); 
}

/* Ghost — Ação terciária / sutil */
.btn-ghost {
  background: transparent; color: var(--color-neutral-600);
  border-color: transparent; padding: var(--space-2) var(--space-4);
}
.btn-ghost:hover:not(:disabled) { 
  color: var(--color-primary); 
  background: var(--color-primary-pale); 
}

/* Accent — CTA especial (PIX, compartilhar) */
.btn-accent {
  background: var(--color-accent); color: var(--color-text-inverse);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-accent);
}
.btn-accent:hover:not(:disabled) { 
  background: var(--color-accent-hover); 
  border-color: var(--color-accent-hover); 
  transform: translateY(-1px); 
  box-shadow: var(--shadow-accent-lg); 
}

/* Success — Para ações positivas */
.btn-success {
  background: var(--color-success); color: var(--color-text-inverse);
  border-color: var(--color-success);
}
.btn-success:hover:not(:disabled) { background: #00642A; border-color: #00642A; text-decoration: none; }

/* Sizes */
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-lg); }
.btn-xl { padding: var(--space-5) var(--space-10); font-size: var(--text-xl); }

/* Full width */
.btn-block { width: 100%; }

/* With icon */
.btn svg { width: 20px; height: 20px; flex-shrink: 0; }
.btn-sm svg { width: 16px; height: 16px; }
.btn-lg svg { width: 24px; height: 24px; }
'@

# ============================================================================
# PATCH 2: Cards System (Hierarchy: elevated, outlined, filled, interactive)
# ============================================================================
$oldCards = @'
/* --------------------------------------------------------------------------
   Cards
   -------------------------------------------------------------------------- */
.card {
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base), border-color var(--transition-base), transform var(--transition-base);
}
.card:hover { box-shadow: var(--shadow-md); border-color: var(--color-border); }
.card:focus-within { box-shadow: var(--shadow-md); border-color: var(--color-border-focus); }

.card-padded { padding: var(--space-6); }

/* Feature card (home benefits) */
.feature-card {
  text-align: center; padding: var(--space-6);
}
.feature-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: var(--radius-md);
  background: var(--color-primary); color: var(--color-text-inverse);
  margin-bottom: var(--space-4);
}
.feature-icon svg { width: 24px; height: 24px; }
.feature-title { font-size: var(--text-lg); margin-bottom: var(--space-2); }
.feature-description { color: var(--color-text-muted); font-size: var(--text-base); line-height: var(--leading-relaxed); }
.feature-link {
  display: inline-flex; align-items: center; gap: var(--space-1);
  font-size: var(--text-sm); font-weight: 600; color: var(--color-primary);
  text-decoration: none;
}
.feature-link:hover { text-decoration: underline; }
.feature-link svg { width: 16px; height: 16px; transition: transform var(--transition-fast); }
.feature-link:hover svg { transform: translateX(2px); }
'@

$newCards = @'
/* --------------------------------------------------------------------------
   Cards — Hierarquia visual (elevated, outlined, filled, interactive)
   -------------------------------------------------------------------------- */
.card {
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

.card-padded { padding: var(--space-6); }

/* Feature card (home benefits) */
.feature-card {
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  text-align: center;
  transition: box-shadow var(--transition-base), border-color var(--transition-base), transform var(--transition-base);
}
.feature-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}
.feature-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; border-radius: var(--radius-lg);
  background: var(--color-primary); color: var(--color-text-inverse);
  margin-bottom: var(--space-4);
}
.feature-icon svg { width: 28px; height: 28px; }
.feature-title { font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-2); color: var(--color-text); }
.feature-description { color: var(--color-text-muted); font-size: var(--text-base); line-height: var(--leading-relaxed); margin-bottom: var(--space-4); }
.feature-link {
  display: inline-flex; align-items: center; gap: var(--space-1);
  font-size: var(--text-sm); font-weight: 600; color: var(--color-primary);
  text-decoration: none;
}
.feature-link:hover { text-decoration: underline; }
.feature-link svg { width: 16px; height: 16px; transition: transform var(--transition-fast); }
.feature-link:hover svg { transform: translateX(2px); }
'@

# ============================================================================
# PATCH 3: Forms System (Inputs, Selects, Checkboxes)
# ============================================================================
$oldForms = @'
/* --------------------------------------------------------------------------
   Forms
   -------------------------------------------------------------------------- */
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: var(--text-sm); font-weight: 500; color: var(--color-text); }
.form-input, .form-select {
  width: 100%; padding: var(--space-3) var(--space-4);
  font-family: inherit; font-size: var(--text-base); color: var(--color-text);
  background: var(--color-bg-alt); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.form-input:focus, .form-select:focus {
  outline: none; border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-light);
}
.form-input::placeholder { color: var(--color-text-muted); }
.form-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%234A504A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right var(--space-3) center; padding-right: var(--space-10); }
.form-checkbox { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-base); color: var(--color-text); min-height: 44px; }
.form-checkbox input { width: 24px; height: 24px; accent-color: var(--color-primary); cursor: pointer; flex-shrink: 0; }
.form-checkbox input:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; border-radius: var(--radius-sm); }
'@

$newForms = @'
/* --------------------------------------------------------------------------
   Forms — Inputs, Selects, Checkboxes com foco acessível
   -------------------------------------------------------------------------- */
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: var(--text-sm); font-weight: 500; color: var(--color-text); }

.form-input, .form-select {
  width: 100%; padding: var(--space-3) var(--space-4);
  font-family: inherit; font-size: var(--text-base); color: var(--color-text);
  background: var(--color-neutral-100); border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md); transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.form-input:focus, .form-select:focus {
  outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-pale);
}
.form-input::placeholder { color: var(--color-neutral-500); }
.form-select { 
  cursor: pointer; appearance: none; 
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23686058' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); 
  background-repeat: no-repeat; background-position: right var(--space-3) center; padding-right: var(--space-10); 
}
.form-checkbox { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-base); color: var(--color-text); min-height: 44px; }
.form-checkbox input { width: 24px; height: 24px; accent-color: var(--color-primary); cursor: pointer; flex-shrink: 0; }
.form-checkbox input:focus-visible { outline: 3px solid var(--color-primary); outline-offset: 3px; border-radius: var(--radius-sm); }
'@

# ============================================================================
# PATCH 4: Hero Section (Orchestrated entrance + Trust bar)
# ============================================================================
$oldHero = @'
/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */
.hero {
  position: relative; padding: var(--space-16) 0; text-align: center;
  background: linear-gradient(135deg, var(--color-primary-pale) 0%, var(--color-neutral-100) 100%);
  color: var(--color-text);
  overflow: hidden;
}

.hero-badge {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm); font-weight: 500; color: var(--color-accent);
  background: rgba(212, 168, 0, 0.15); border: 1px solid var(--color-accent);
  border-radius: var(--radius-full); margin-bottom: var(--space-6);
}
.hero-badge svg { width: 16px; height: 16px; flex-shrink: 0; }

.hero-title {
  font-size: clamp(var(--text-3xl), 5vw, var(--text-4xl));
  font-weight: 800; line-height: var(--leading-tight);
  letter-spacing: -0.02em; margin-bottom: var(--space-4); color: var(--color-text);
}
.hero-title .highlight { color: var(--color-accent); }

.hero-description {
  font-size: var(--text-lg); line-height: var(--leading-relaxed);
  color: var(--color-text-muted); max-width: 680px; margin: 0 auto var(--space-8);
}

.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-4); justify-content: center; margin-bottom: var(--space-10); }

/* Trust bar */
.hero-trust {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--space-4);
  font-size: var(--text-sm); color: var(--color-text-muted);
  border-top: 1px solid var(--color-border); padding-top: var(--space-8); margin-top: var(--space-8);
}
.hero-trust-item { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.hero-trust-item svg { 
  width: 18px; height: 18px; 
  color: var(--color-text-inverse);
  background: var(--color-primary);
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.hero-trust-item span { word-break: break-word; hyphens: auto; }

@media (max-width: 480px) {
  .hero-trust { gap: var(--space-3); }
  .hero-trust-item { font-size: var(--text-xs); gap: var(--space-1); }
  .hero-trust-item svg { width: 16px; height: 16px; }
}
'@

$newHero = @'
/* --------------------------------------------------------------------------
   Hero — Entrada orquestrada + Trust bar
   -------------------------------------------------------------------------- */
.hero {
  position: relative; padding: var(--space-16) 0; text-align: center;
  background: linear-gradient(135deg, var(--color-primary-pale) 0%, var(--color-neutral-100) 100%);
  color: var(--color-text);
  overflow: hidden;
}

.hero-badge {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm); font-weight: 500; color: var(--color-accent);
  background: var(--color-accent-pale); border: 1px solid var(--color-accent);
  border-radius: var(--radius-full); margin-bottom: var(--space-6);
  animation: slide-up var(--transition-slow) ease forwards;
}
.hero-badge svg { width: 16px; height: 16px; flex-shrink: 0; }

.hero-title {
  font-size: clamp(var(--text-3xl), 5vw, var(--text-4xl));
  font-weight: 800; line-height: var(--leading-tight);
  letter-spacing: -0.02em; margin-bottom: var(--space-4); color: var(--color-text);
}
.hero-title .highlight {
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: var(--text-lg); line-height: var(--leading-relaxed);
  color: var(--color-text-muted); max-width: 680px; margin: 0 auto var(--space-8);
}

.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-4); justify-content: center; margin-bottom: var(--space-10); }

/* Trust bar */
.hero-trust {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--space-4);
  font-size: var(--text-sm); color: var(--color-text-muted);
  border-top: 1px solid var(--color-border); padding-top: var(--space-8); margin-top: var(--space-8);
}
.hero-trust-item { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.hero-trust-item svg { 
  width: 18px; height: 18px; 
  color: var(--color-text-inverse);
  background: var(--color-primary);
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.hero-trust-item span { word-break: break-word; hyphens: auto; }

@media (max-width: 480px) {
  .hero-trust { gap: var(--space-3); }
  .hero-trust-item { font-size: var(--text-xs); gap: var(--space-1); }
  .hero-trust-item svg { width: 16px; height: 16px; }
}

/* Animations */
@keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.animate-fade-in { animation: fade-in var(--transition-base) ease forwards; }
.animate-slide-up { animation: slide-up var(--transition-slow) ease forwards; }

/* Stagger children */
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 80ms; }
.stagger > *:nth-child(3) { animation-delay: 160ms; }
.stagger > *:nth-child(4) { animation-delay: 240ms; }
.stagger > *:nth-child(5) { animation-delay: 320ms; }
.stagger > *:nth-child(6) { animation-delay: 400ms; }

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in, .animate-slide-up { animation: none !important; opacity: 1; transform: none; }
}
'@

# Apply all patches
$content = Get-Content "src/styles/global.css" -Raw
$content = $content -replace [Regex]::Escape($oldButtons), $newButtons
$content = $content -replace [Regex]::Escape($oldCards), $newCards
$content = $content -replace [Regex]::Escape($oldForms), $newForms
$content = $content -replace [Regex]::Escape($oldHero), $newHero

Set-Content "src/styles/global.css" $content
Write-Host "All CSS patches applied successfully"