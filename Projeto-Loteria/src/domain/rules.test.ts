import { describe, expect, it } from 'vitest';

import { MODALIDADES, modalidadePorId } from './rules';

describe('rules', () => {
  it('has four modalidades', () => {
    expect(MODALIDADES).toHaveLength(4);
  });

  it('modalidadePorId returns matching rules', () => {
    const rules = modalidadePorId('quina');
    expect(rules.nome).toBe('Quina');
    expect(rules.universo).toBe(80);
  });

  it('modalidadePorId throws for unknown', () => {
    expect(() => modalidadePorId('x' as never)).toThrow();
  });
});
