import { describe, expect, it } from 'vitest';

import { ALGORITHM_VERSION } from './version';

describe('version', () => {
  it('exposes a version string', () => {
    expect(ALGORITHM_VERSION).toBe('0.1.0');
  });
});
