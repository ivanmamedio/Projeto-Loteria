/**
 * Carregamento lazy de dados JSON com verificação de schemaVersion.
 */

export const SCHEMA_VERSION = 1;

export interface LoadResult<T> {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: string;
}

export async function loadData<T = unknown>(url: string): Promise<LoadResult<T>> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as { schemaVersion?: number } & T;
    if (json.schemaVersion !== undefined && json.schemaVersion !== SCHEMA_VERSION) {
      return { ok: false, error: 'Versão de schema incompatível.' };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha de rede.' };
  }
}
