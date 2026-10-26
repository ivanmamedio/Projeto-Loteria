/**
 * Algoritmo version.
 * Referência: tasks_loteria.md — T0.3 (confirmação das regras)
 *
 * Versão do algoritmo usado para gerar jogos e calcular probabilidades.
 * Suba a versão sempre que houver mudança nas regras, métodos ou fórmulas.
 */
export const ALGORITHM_VERSION = '0.1.0' as const;

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: ALGORITHM_VERSION,
    date: new Date().toISOString(),
    changes: [
      'Cria projeto Astro + TypeScript puro.',
      'Implementa lógica de amostragem sem reposição (F10).',
      'Adiciona filtros de equilíbrio (F11).',
      'Implementa geração de lotes (F12).',
    ],
  },
];
