# PowerShell script to apply patches to global.css

$content = Get-Content "src/styles/global.css" -Raw

# Patch 1: Update Button system
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

$content = Get-Content "src/styles/global.css" -Raw
$content = $content -replace [Regex]::Escape($oldButtons), $newButtons
Set-Content "src/styles/global.css" $content
Write-Host "Buttons updated"