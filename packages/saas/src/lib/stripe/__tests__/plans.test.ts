import { describe, it, expect } from 'vitest';
import { PLANS, getPlan } from '../../stripe/plans.js';

describe('PLANS', () => {
  it('defines free, pro, and agency tiers', () => {
    expect(PLANS).toHaveProperty('free');
    expect(PLANS).toHaveProperty('pro');
    expect(PLANS).toHaveProperty('agency');
  });

  it('free plan has price 0', () => {
    expect(PLANS.free.price).toBe(0);
  });

  it('free plan has priceId null', () => {
    expect(PLANS.free.priceId).toBeNull();
  });

  it('free plan does not allow custom domains', () => {
    expect(PLANS.free.customDomain).toBe(false);
  });

  it('free plan does not allow analytics', () => {
    expect(PLANS.free.analytics).toBe(false);
  });

  it('pro plan allows custom domains', () => {
    expect(PLANS.pro.customDomain).toBe(true);
  });

  it('pro plan allows analytics', () => {
    expect(PLANS.pro.analytics).toBe(true);
  });

  it('agency plan has a higher projectLimit than pro', () => {
    expect(PLANS.agency.projectLimit).toBeGreaterThan(PLANS.pro.projectLimit);
  });

  it('agency plan has a higher deployLimit than pro', () => {
    expect(PLANS.agency.deployLimit).toBeGreaterThan(PLANS.pro.deployLimit);
  });

  it('pro and agency use month as interval', () => {
    expect(PLANS.pro.interval).toBe('month');
    expect(PLANS.agency.interval).toBe('month');
  });
});

describe('getPlan', () => {
  it('returns the free plan for null', () => {
    expect(getPlan(null)).toStrictEqual(PLANS.free);
  });

  it('returns the free plan for undefined', () => {
    expect(getPlan(undefined)).toStrictEqual(PLANS.free);
  });

  it('returns the free plan for an unknown string', () => {
    expect(getPlan('enterprise')).toStrictEqual(PLANS.free);
  });

  it('returns the correct plan for a valid id', () => {
    expect(getPlan('pro')).toStrictEqual(PLANS.pro);
    expect(getPlan('agency')).toStrictEqual(PLANS.agency);
    expect(getPlan('free')).toStrictEqual(PLANS.free);
  });
});
