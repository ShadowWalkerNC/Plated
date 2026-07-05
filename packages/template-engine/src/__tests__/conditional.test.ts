import { describe, it, expect } from 'vitest';
import { evaluateConditional } from '../conditional.js';

describe('evaluateConditional', () => {
  it('returns true when token matches expected value', () => {
    expect(evaluateConditional({ token: 'businessType', equals: 'restaurant' }, { businessType: 'restaurant' })).toBe(true);
  });

  it('returns false when token does not match', () => {
    expect(evaluateConditional({ token: 'businessType', equals: 'cafe' }, { businessType: 'restaurant' })).toBe(false);
  });

  it('returns true when token is truthy and no equals is specified', () => {
    expect(evaluateConditional({ token: 'social.instagram' }, { 'social.instagram': 'https://instagram.com/test' })).toBe(true);
  });

  it('returns false when token is empty string and no equals is specified', () => {
    expect(evaluateConditional({ token: 'social.instagram' }, { 'social.instagram': '' })).toBe(false);
  });

  it('returns false when token is missing', () => {
    expect(evaluateConditional({ token: 'nonexistent' }, {})).toBe(false);
  });

  it('supports negation via not: true', () => {
    expect(evaluateConditional({ token: 'social.facebook', not: true }, { 'social.facebook': '' })).toBe(true);
  });
});
