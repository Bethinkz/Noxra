/**
 * Setup for the browser test suite.
 *
 * Loads Noxra's stylesheet into the test document, because the guarantees this
 * suite exists to check are CSS ones: `pointer-events: none` blocking a click,
 * a transition landing on its new value after a theme swap, a dialog backdrop
 * painting from the scrim token. Without the styles the suite would pass while
 * asserting nothing, which is worse than not having it at all.
 *
 * It is fetched rather than imported. Neither `import './x.css'` nor `?inline`
 * works through the Angular test pipeline: the first resolves but puts nothing
 * in the document, the second returns a stub.
 *
 * The `?direct` suffix matters. Without it the dev server answers a `.css`
 * request with a *JavaScript module* that carries the CSS as a string, which
 * lands in a `<style>` tag as syntactically invalid CSS and quietly produces
 * zero rules - a suite that passes every assertion against unstyled elements.
 * `?direct` returns the compiled stylesheet itself, `@import`s resolved.
 *
 * The rule count is verified after injection rather than trusted, because
 * every failure mode here is silent.
 */

export {};

const STYLESHEET_URL = '/projects/noxra/src/styles/noxra.css?direct';

const response = await fetch(STYLESHEET_URL);

if (!response.ok) {
  throw new Error(
    `Browser tests could not load ${STYLESHEET_URL} (HTTP ${response.status}). ` +
      'Every CSS assertion in this suite would silently pass against unstyled ' +
      'elements, so this is fatal rather than a warning.',
  );
}

const css = await response.text();

const style = document.createElement('style');
style.id = 'noxra-test-styles';
style.textContent = css;
document.head.appendChild(style);

// The only trustworthy check: did the browser actually parse rules out of it?
const ruleCount = style.sheet?.cssRules.length ?? 0;

if (ruleCount === 0) {
  throw new Error(
    `${STYLESHEET_URL} returned ${css.length} bytes but produced no CSS rules. ` +
      'The dev server is most likely answering with a JavaScript module rather ' +
      'than a stylesheet.',
  );
}
