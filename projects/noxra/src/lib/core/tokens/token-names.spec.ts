import { NX_THEME_OWNED_GROUPS, NX_TOKEN_GROUPS, NX_TOKEN_NAMES } from './token-names';

/**
 * Structural invariants of the token contract.
 *
 * Parity between this contract and the CSS is checked separately by
 * `tools/check-tokens.mjs`, which can read the stylesheets from disk.
 */
describe('token contract', () => {
  it('has no duplicate token names', () => {
    expect(new Set(NX_TOKEN_NAMES).size).toBe(NX_TOKEN_NAMES.length);
  });

  it('namespaces every token', () => {
    for (const token of NX_TOKEN_NAMES) {
      expect(token.startsWith('--nx-')).toBe(true);
    }
  });

  it('has no empty groups', () => {
    for (const [group, tokens] of Object.entries(NX_TOKEN_GROUPS)) {
      expect(tokens.length, `group "${group}" is empty`).toBeGreaterThan(0);
    }
  });

  it('only marks real groups as theme-owned', () => {
    for (const group of NX_THEME_OWNED_GROUPS) {
      expect(Object.keys(NX_TOKEN_GROUPS)).toContain(group);
    }
  });

  it('keeps colour out of the structural groups', () => {
    const structural = Object.keys(NX_TOKEN_GROUPS).filter(
      (group) => !(NX_THEME_OWNED_GROUPS as readonly string[]).includes(group),
    );

    expect(structural).toEqual(['radius', 'space', 'typography', 'focus', 'motion', 'zIndex']);
  });
});
