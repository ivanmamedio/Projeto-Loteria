import { describe, expect, it } from 'vitest';

import { gerarLote } from './diversify';
import { mulberry32 } from './rng';

describe('diversify', () => {
  it('gerarLote returns requested number of games', () => {
    const lote = gerarLote(
      [1, 2, 3, 4, 5, 6],
      { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      { numeroDezenas: 2, numeroJogos: 2, beta: 1, alfa: 1, lambda: 30 },
      mulberry32(1),
    );
    expect(lote).toHaveLength(2);
  });
});
