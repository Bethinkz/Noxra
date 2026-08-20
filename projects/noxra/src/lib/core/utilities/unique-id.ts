/**
 * Browser-only unique element ids.
 *
 * A counter is deliberate rather than `crypto.randomUUID()`: ids appear in
 * `aria-describedby`, and a stable, readable one is far easier to debug.
 *
 * The counter is module-level state, which the architecture rules otherwise
 * discourage. It is acceptable here for one specific reason: every caller
 * generates ids only for elements created in the browser, after hydration.
 * Nothing generated here is ever server-rendered, so server and client output
 * cannot disagree and the counter can never cause a hydration mismatch.
 *
 * The moment something needs an id on a *server-rendered* element, this is the
 * wrong tool - that case needs a DI-scoped counter reset per application, so
 * both renders produce the same sequence.
 */

let counter = 0;

/** Returns an id like `nx-tooltip-3`, unique within the document. */
export function nxUniqueId(prefix: string): string {
  counter += 1;
  return `nx-${prefix}-${counter}`;
}
