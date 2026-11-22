/**
 * Utilitário para resolver o base URL corretamente em dev e produção.
 * Em produção (build), `import.meta.env.BASE_URL` já inclui o base path.
 * Em desenvolvimento, o dev server roda na raiz `/`, então precisamos prefixar manualmente.
 */

const CONFIGURED_BASE = '/Projeto-Loteria';

/**
 * Retorna o base URL correto para o ambiente atual.
 * Em produção: usa `import.meta.env.BASE_URL` (ex: `/Projeto-Loteria/`)
 * Em desenvolvimento: retorna o base configurado manualmente (ex: `/Projeto-Loteria/`)
 */
export function getBaseUrl(): string {
  // Em produção (build), BASE_URL já inclui o base path
  if (import.meta.env.PROD) {
    return import.meta.env.BASE_URL;
  }

  // Em desenvolvimento, o dev server roda na raiz, então usamos o base configurado
  return CONFIGURED_BASE;
}

/**
 * Constrói uma URL completa com o base path correto.
 * Útil para fetch de assets públicos, API routes, etc.
 */
export function buildUrl(path: string): string {
  const base = getBaseUrl();
  // Remove trailing slash do base e leading slash do path para evitar //
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Versão para uso no cliente (browser) - detecta se está em GitHub Pages
 */
export function getClientBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Em produção no GitHub Pages, o pathname já inclui o base
    const path = window.location.pathname;
    const match = path.match(/^(\/Projeto-Loteria)/);
    if (match?.[1]) {
      return match[1];
    }
    // Fallback para desenvolvimento local
    return CONFIGURED_BASE;
  }
  // Server-side (SSR/API routes)
  return getBaseUrl();
}
