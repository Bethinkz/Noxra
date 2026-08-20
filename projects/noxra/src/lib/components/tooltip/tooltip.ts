import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
} from '@angular/core';

import { nxUniqueId } from '../../core/utilities/unique-id';
import type { NxTooltipPlacement } from './tooltip.types';

/**
 * Tooltip — a description attached to any element.
 *
 * Styles: `@noxra/ui/styles/components/tooltip.css`.
 *
 * ```html
 * <button nxButton nxTooltip="Save changes">Save</button>
 * <button nxButton nxTooltip="Delete" tooltipPlacement="bottom">Delete</button>
 * ```
 *
 * ## No positioning engine
 *
 * The bubble is a Popover API element, so the browser puts it in the top layer
 * — it escapes `overflow: hidden` and stacking contexts without Noxra
 * reparenting anything. Placement is CSS anchor positioning:
 * `anchor-name` on the trigger, `position-anchor` and `position-area` on the
 * bubble, and `position-try-fallbacks` so the browser flips it when there is
 * no room.
 *
 * That is the whole positioning implementation, and it is why Tooltip adds no
 * dependency. `@angular/cdk`'s overlay exists for the harder version of this
 * problem — scroll containers, virtual scrolling, repositioning on every
 * scroll frame — which a tooltip does not have.
 *
 * ## The one element it adds
 *
 * Noxra's components otherwise emit no DOM, but a tooltip has nothing to
 * attach text to. The bubble is created lazily, on first show, and reused
 * afterwards, so an element that is never hovered costs nothing.
 *
 * ## Accessibility
 *
 * The bubble carries `role="tooltip"` and the trigger gets `aria-describedby`,
 * so the description is announced rather than merely drawn. It opens on focus
 * as well as hover — a tooltip only reachable by pointer is invisible to
 * keyboard users — and Escape dismisses it, as WAI-ARIA requires.
 *
 * A tooltip *describes*; it must not be the only source of an element's name.
 * An icon-only button still needs its own accessible name.
 */
@Directive({
  selector: '[nxTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class NxTooltip {
  private readonly document = inject(DOCUMENT);
  private readonly trigger = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Anchor names are CSS idents, so they share the element id. */
  private readonly id = nxUniqueId('tooltip');

  private bubble: HTMLElement | undefined;

  /** The description. An empty value disables the tooltip entirely. */
  readonly nxTooltip = input.required<string>();

  /** Preferred side. The browser flips it when there is no room. */
  readonly tooltipPlacement = input<NxTooltipPlacement>('top');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.bubble?.remove());

    effect(() => {
      const text = this.nxTooltip();
      const placement = this.tooltipPlacement();

      // Keeps an already-created bubble in step with its inputs.
      if (this.bubble) {
        this.bubble.textContent = text;
        this.bubble.setAttribute('data-placement', placement);
      }
    });
  }

  protected show(): void {
    if (!this.isBrowser || !this.nxTooltip()) {
      return;
    }

    const bubble = this.bubble ?? this.create();
    bubble.showPopover?.();
  }

  protected hide(): void {
    this.bubble?.hidePopover?.();
  }

  private create(): HTMLElement {
    const bubble = this.document.createElement('div');

    bubble.id = this.id;
    bubble.className = 'nx-tooltip';
    bubble.setAttribute('role', 'tooltip');
    bubble.setAttribute('data-placement', this.tooltipPlacement());
    bubble.textContent = this.nxTooltip();

    // `manual` rather than `auto`: an `auto` popover light-dismisses and closes
    // other open popovers, so hovering a tooltip would shut an open menu.
    bubble.setAttribute('popover', 'manual');

    // The anchor link. Set as a custom property rather than a CSS rule so the
    // stylesheet stays static and every instance gets its own anchor.
    this.trigger.style.setProperty('anchor-name', `--${this.id}`);
    bubble.style.setProperty('position-anchor', `--${this.id}`);

    this.trigger.setAttribute('aria-describedby', this.id);
    this.document.body.appendChild(bubble);

    this.bubble = bubble;
    return bubble;
  }
}
