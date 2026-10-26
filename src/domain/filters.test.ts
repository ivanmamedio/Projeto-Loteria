import { describe, expect, it } from 'vitest';

import { filtrosEquilibrio, verificaFiltros } from './filters';

describe('filters', () => {
  it('filtrosEquilibrio returns ordered ranges', () => {
    const f = filtrosEquilibrio(60, 6);
    expect(f.somaMin).toBeLessThan(f.somaMax);
    expect(f.paresMin).toBeLessThanOrEqual(f.paresMax);
  });

  it('verificaFiltros passes a balanced combination', () => {
    const f = filtrosEquilibrio(60, 6);
    const result = verificaFiltros([10, 20, 30, 40, 50, 60], 60, f);
    expect(typeof result.passa).toBe('boolean');
    expect(result.soma).toBe(210);
  });
});
