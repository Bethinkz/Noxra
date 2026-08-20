import { TestBed } from '@angular/core/testing';

import { NxMotionService } from './motion';

/**
 * Browser-only. jsdom can confirm the intensity attribute is written, but not
 * that it changes anything — resolving `var(--nx-duration-normal)` through a
 * cascade of attribute-scoped rules needs a real style engine.
 *
 * The ordering assertion is the important one. Intensity and reduced motion
 * carry the same specificity, so only source order makes the accessibility
 * requirement beat the taste preference. That is exactly the kind of rule a
 * later edit reorders by accident.
 */
describe('NxMotionService intensity (browser)', () => {
  afterEach(() => {
    const root = document.documentElement;
    root.removeAttribute('data-nx-motion');
    root.removeAttribute('data-nx-motion-intensity');
  });

  const durationOf = (token: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(token).trim();

  it('scales durations and distances with intensity', () => {
    const service = TestBed.inject(NxMotionService);

    service.setIntensity('medium');
    const mediumDuration = durationOf('--nx-duration-normal');
    const mediumDistance = durationOf('--nx-distance-medium');

    service.setIntensity('low');
    const lowDuration = durationOf('--nx-duration-normal');
    const lowDistance = durationOf('--nx-distance-medium');

    service.setIntensity('high');
    const highDuration = durationOf('--nx-duration-normal');
    const highDistance = durationOf('--nx-distance-medium');

    expect(parseFloat(lowDuration)).toBeLessThan(parseFloat(mediumDuration));
    expect(parseFloat(highDuration)).toBeGreaterThan(parseFloat(mediumDuration));
    expect(parseFloat(lowDistance)).toBeLessThan(parseFloat(mediumDistance));
    expect(parseFloat(highDistance)).toBeGreaterThan(parseFloat(mediumDistance));
  });

  it('lets reduced motion override even the highest intensity', () => {
    const service = TestBed.inject(NxMotionService);

    service.setIntensity('high');
    expect(parseFloat(durationOf('--nx-duration-normal'))).toBeGreaterThan(200);

    service.setPreference('reduced');

    // Both attributes are on the element with equal specificity; reduced
    // motion wins because its rules come later in the stylesheet.
    expect(durationOf('--nx-duration-normal')).toBe('1ms');
    expect(durationOf('--nx-distance-medium')).toBe('0px');
    expect(durationOf('--nx-scale-enter')).toBe('1');
  });

  it('leaves looping motion alone', () => {
    const service = TestBed.inject(NxMotionService);

    service.setIntensity('medium');
    const medium = durationOf('--nx-duration-loop');

    service.setIntensity('high');
    // How fast a spinner turns is not a matter of taste.
    expect(durationOf('--nx-duration-loop')).toBe(medium);
  });
});
