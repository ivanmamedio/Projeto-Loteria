import { describe, expect, it } from 'vitest';
import { pad2 } from './format';

describe('format', () => {
  it('pad2', () => {
    expect(pad2(0)).toBe('00');
    expect(pad2(7)).toBe('07');
    expect(pad2(12)).toBe('12');
  });
});
