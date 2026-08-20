/**
 * Minimal `<dialog>` support for jsdom.
 *
 * jsdom 28 exposes `HTMLDialogElement` but implements neither `showModal()`
 * nor `close()`, so any component built on the native element is untestable
 * without this. It fills the gap with just enough behaviour to exercise
 * *Noxra's* logic — the `open` property, the `close` event, `returnValue` —
 * and nothing more.
 *
 * What it deliberately does not simulate: the top layer, focus trapping, focus
 * restoration, `inert` on the background, and Escape handling. Those are the
 * browser's, which is the entire reason Noxra uses the native element rather
 * than reimplementing them. They cannot be asserted here, and pretending
 * otherwise would be worse than not testing them — that gap belongs to browser
 * tests.
 *
 * Excluded from the library build; see `tsconfig.lib.json`.
 */

type PatchableDialog = HTMLDialogElement;

const proto = globalThis.HTMLDialogElement?.prototype as PatchableDialog | undefined;

if (proto && typeof proto.showModal !== 'function') {
  Object.defineProperty(proto, 'open', {
    configurable: true,
    get(this: PatchableDialog) {
      return this.hasAttribute('open');
    },
    set(this: PatchableDialog, value: boolean) {
      if (value) {
        this.setAttribute('open', '');
      } else {
        this.removeAttribute('open');
      }
    },
  });

  proto.showModal = function showModal(this: PatchableDialog): void {
    this.setAttribute('open', '');
  };

  proto.show = function show(this: PatchableDialog): void {
    this.setAttribute('open', '');
  };

  proto.close = function close(this: PatchableDialog, returnValue?: string): void {
    if (!this.hasAttribute('open')) {
      return;
    }

    this.removeAttribute('open');

    if (returnValue !== undefined) {
      this.returnValue = returnValue;
    }

    // The spec queues an element task, so real browsers fire `close`
    // asynchronously. Firing it synchronously here would let the jsdom suite
    // pass while hiding a timing assumption that fails in a browser - which is
    // exactly what it did before this was corrected.
    setTimeout(() => this.dispatchEvent(new Event('close')), 0);
  };
}
