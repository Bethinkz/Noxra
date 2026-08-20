import { TestBed } from '@angular/core/testing';

import { NOXRA_CONFIG } from '../noxra-config';
import { NxMotionService } from './motion';

describe('NxMotionService', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-nx-motion');
    document.documentElement.removeAttribute('data-nx-motion-intensity');
  });

  it('defaults to following the system preference', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxMotionService);

    expect(service.preference()).toBe('system');
    // `system` means "no override", so the media query stays in charge.
    expect(document.documentElement.hasAttribute('data-nx-motion')).toBe(false);
    expect(service.reduced()).toBe(false);
  });

  it('publishes an explicit override as an attribute', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxMotionService);

    service.setPreference('reduced');

    expect(document.documentElement.getAttribute('data-nx-motion')).toBe('reduced');
    expect(service.reduced()).toBe(true);
  });

  it('lets an application opt out of reduced motion', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxMotionService);

    service.setPreference('full');

    expect(document.documentElement.getAttribute('data-nx-motion')).toBe('full');
    expect(service.reduced()).toBe(false);
  });

  it('clears the override when returning to system', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxMotionService);

    service.setPreference('reduced');
    service.setPreference('system');

    expect(document.documentElement.hasAttribute('data-nx-motion')).toBe(false);
  });

  it('honours a configured preference', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: NOXRA_CONFIG, useValue: { motion: 'reduced' } }],
    });
    const service = TestBed.inject(NxMotionService);

    expect(service.reduced()).toBe(true);
  });

  it('defaults to medium intensity and sets no attribute for it', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxMotionService);

    expect(service.intensity()).toBe('medium');
    // Medium is the absence of an override, like `system` for the preference.
    expect(document.documentElement.hasAttribute('data-nx-motion-intensity')).toBe(false);
  });

  it('publishes a non-default intensity as an attribute', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxMotionService);

    service.setIntensity('high');
    expect(document.documentElement.getAttribute('data-nx-motion-intensity')).toBe('high');

    service.setIntensity('low');
    expect(document.documentElement.getAttribute('data-nx-motion-intensity')).toBe('low');

    service.setIntensity('medium');
    expect(document.documentElement.hasAttribute('data-nx-motion-intensity')).toBe(false);
  });

  it('honours a configured intensity', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: NOXRA_CONFIG, useValue: { motionIntensity: 'low' } }],
    });
    const service = TestBed.inject(NxMotionService);

    expect(service.intensity()).toBe('low');
    expect(document.documentElement.getAttribute('data-nx-motion-intensity')).toBe('low');
  });

  it('keeps intensity independent of reduced motion', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxMotionService);

    service.setIntensity('high');
    service.setPreference('reduced');

    // Two separate axes. The preference is an accessibility requirement and
    // wins in CSS; the intensity is remembered for when it no longer applies.
    expect(service.reduced()).toBe(true);
    expect(service.intensity()).toBe('high');
    expect(document.documentElement.getAttribute('data-nx-motion-intensity')).toBe('high');
    expect(document.documentElement.getAttribute('data-nx-motion')).toBe('reduced');
  });
});
