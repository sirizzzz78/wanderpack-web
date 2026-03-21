import { describe, it, expect } from 'vitest';
import { isRestricted } from '../carryOnRules';

describe('isRestricted', () => {
  it('detects exact restricted item', () => {
    expect(isRestricted('knife')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isRestricted('KNIFE')).toBe(true);
    expect(isRestricted('Knife')).toBe(true);
  });

  it('detects restricted keyword within a phrase', () => {
    expect(isRestricted('Cutting Board & Knife')).toBe(true);
  });

  it('detects irregular plural "knives"', () => {
    expect(isRestricted('knives')).toBe(true);
  });

  it('detects compound item "Trekking Poles"', () => {
    expect(isRestricted('Trekking Poles')).toBe(true);
  });

  it('returns false for safe items', () => {
    expect(isRestricted('Sunscreen')).toBe(false);
  });

  it('does not false-positive on partial matches', () => {
    expect(isRestricted('Sunglasses')).toBe(false);
  });

  it('detects "Lighter / Matches" components individually', () => {
    // "lighter fluid" is restricted, bare "lighter" is not in keyword list
    expect(isRestricted('Lighter Fluid')).toBe(true);
    // "matches" lemmatizes to "match" which is not a standalone keyword
    expect(isRestricted('Lighter / Matches')).toBe(false);
  });

  it('detects "Fire Starter"', () => {
    expect(isRestricted('Fire Starter')).toBe(true);
  });

  it('detects "Insect Repellent"', () => {
    expect(isRestricted('Insect Repellent')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isRestricted('')).toBe(false);
  });

  it('detects "Fuel Canister" but not bare "Fuel"', () => {
    expect(isRestricted('Fuel Canister')).toBe(true);
    expect(isRestricted('Fuel')).toBe(false);
  });
});
