# Motion

Motion is a first-class part of Noxra, which means it is a **system**, not a
collection of per-component timings. This milestone establishes the system; the
choreography comes later.

## The rule

> No component may hard-code a duration, easing curve, distance or scale. All
> four come from tokens.

This is not style policing. It is what makes reduced motion a one-place concern
instead of a per-component obligation that someone will eventually forget.

## Tokens

**Durations** — for transitions and one-shot animations.

| Token                   | Value   | Use                                |
| ----------------------- | ------- | ---------------------------------- |
| `--nx-duration-instant` | `60ms`  | Press feedback, immediate response |
| `--nx-duration-fast`    | `120ms` | Hover, focus, small state changes  |
| `--nx-duration-normal`  | `200ms` | Standard entrance and exit         |
| `--nx-duration-slow`    | `320ms` | Large surfaces, overlays           |

**Easing** — `enter` and `exit` are asymmetric on purpose: things should arrive
gently and leave decisively.

| Token                    | Curve                             |
| ------------------------ | --------------------------------- |
| `--nx-easing-standard`   | `cubic-bezier(0.2, 0, 0, 1)`      |
| `--nx-easing-enter`      | `cubic-bezier(0.05, 0.7, 0.1, 1)` |
| `--nx-easing-exit`       | `cubic-bezier(0.3, 0, 0.8, 0.15)` |
| `--nx-easing-emphasized` | `cubic-bezier(0.3, 0, 0, 1)`      |

**Distance and scale** — travel and transform amounts.

| Token                  | Value  | Use                       |
| ---------------------- | ------ | ------------------------- |
| `--nx-distance-micro`  | `2px`  | Card lift, nudges         |
| `--nx-distance-small`  | `4px`  | Menu and tooltip entrance |
| `--nx-distance-medium` | `8px`  | Dialogs, drawers          |
| `--nx-scale-enter`     | `0.98` | Entrance scale            |
| `--nx-scale-press`     | `0.97` | Pressed state             |

**Looping** — a separate pair, and the distinction matters. See below.

| Token                | Value    |
| -------------------- | -------- |
| `--nx-duration-loop` | `800ms`  |
| `--nx-easing-loop`   | `linear` |

## Reduced motion

Because every animation reads a token, reduced motion is implemented by
neutralising the tokens — once, in `styles/tokens.css`. **No component contains
a `prefers-reduced-motion` media query.** If you find yourself writing one,
the motion belongs in a token instead.

Under reduced motion:

- durations collapse to `1ms`
- distances collapse to `0px`
- scales collapse to `1`
- the loop slows to `1600ms` and switches to `steps(8, end)`

Durations become `1ms` rather than `0ms` deliberately: at `0ms` browsers may not
fire `transitionend` / `animationend`, which would stall any state machine
waiting on them.

### Looping motion is the exception, and it is handled

A spinner must keep indicating that something is happening even when motion is
reduced — freezing it turns a status indicator into a bug. So looping motion
gets its own token pair, and reduced motion **slows and steps** the loop rather
than removing it.

This is why `--nx-duration-loop` exists separately. Never drive a loop from
`--nx-duration-*`: those collapse to `1ms`, which would turn a spinner into a
strobe.

## Application override

`prefers-reduced-motion` is the default, but an application may need its own
preference toggle. `NxMotionService` overrides it in either direction:

```ts
const motion = inject(NxMotionService);

motion.setPreference('reduced'); // force reduced, regardless of the OS
motion.setPreference('full'); // opt out of reduced motion
motion.setPreference('system'); // default: follow prefers-reduced-motion
```

`system` removes the attribute entirely, leaving the media query in charge —
it is the absence of an override, not a third value.

Resolved state is available as signals:

```ts
motion.reduced(); // should motion be reduced right now?
motion.systemPrefersReduced(); // what the OS reports
motion.preference(); // the application's policy
```

`reduced()` is only needed for motion driven from TypeScript. CSS-driven motion
is already handled by the tokens — do not gate a CSS transition on this signal.

## SSR

`NxMotionService` reads `matchMedia` inside `afterNextRender()`, which never
runs on the server, and reaches it through `DOCUMENT.defaultView` rather than
the `window` global.

On the server `systemPrefersReduced()` is `false`, because the server genuinely
cannot know the user's preference. This causes no hydration mismatch: reduced
motion is expressed in **token values**, not in DOM structure, so the media
query corrects the appearance on the client without changing a single node.

## Writing motion in a component

```css
.nx-button {
  transition:
    background-color var(--nx-duration-fast) var(--nx-easing-standard),
    scale var(--nx-duration-instant) var(--nx-easing-standard);
}

.nx-button--enabled:active {
  scale: var(--nx-scale-press);
}
```

That is the whole pattern. Reduced motion, theming and future retuning are all
handled by the tokens.

Prefer `translate`, `scale` and `rotate` as independent CSS properties over the
`transform` shorthand, so separate concerns can animate without clobbering each
other.

## Theme switching and transitions

A CSS transition whose value comes from a custom property **stalls when that
property changes**. The browser pins the property at the value it held when the
transition started, so a themed `background-color` keeps rendering the previous
theme's colour until something unrelated invalidates it. Reloading hides it,
which is why this class of bug survives demos and shows up in production.

`NxThemeService` handles it: it sets `data-nx-theme-switching` on the document
element, commits the new values, forces a layout flush, and clears the
attribute on the next task. `styles/base.css` disables every transition while
that attribute is present. The swap lands instantly and transitions resume
immediately after.

Two details that are not incidental:

- **The restore is a timeout, not `requestAnimationFrame`.** A hidden or
  backgrounded tab runs no animation frames, so an rAF restore never fires
  there and the application is left with transitions disabled _forever_ —
  exactly the case where the theme follows the system colour scheme and it
  changes while the tab is in the background.
- **The forced layout is what makes the timeout safe.** By the time the
  attribute clears, the new values are already the current computed values, so
  re-enabling transitions cannot start one retroactively.

This is also the one place Noxra uses `!important`: the suppression has to
outrank transitions declared by the consuming application, not just Noxra's
own, and it is active for a single task.

## Angular animations

Noxra does not depend on `@angular/animations`. Motion is CSS, which keeps it
out of the JavaScript bundle, works during SSR-rendered first paint, and stays
independent of Angular's animation package. `npm run check:package` fails if
`@angular/animations` ever appears in the bundle.

For future enter/leave choreography, Angular 22's built-in `animate.enter` and
`animate.leave` template features are the preferred route, since they are class
and CSS driven and require no extra dependency.
