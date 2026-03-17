import { describe, expect, it } from 'vitest';

import { ValidationError } from '../../../../src/domain/errors/ValidationError.js';
import { Amount } from '../../../../src/domain/value-objects/Amount.js';

describe('Amount', () => {
  describe('create', () => {
    it('should create valid amount', () => {
      const amount = Amount.create(50);
      expect(amount.toNumber()).toBe(50);
    });

    it('should round to 2 decimal places', () => {
      const amount = Amount.create(50.999);
      expect(amount.toNumber()).toBe(51);
    });

    it('should throw if amount is not a number', () => {
      expect(() => Amount.create('abc')).toThrow(ValidationError);
      expect(() => Amount.create(null)).toThrow(ValidationError);
    });

    it('should throw if amount is zero', () => {
      expect(() => Amount.create(0)).toThrow(ValidationError);
    });

    it('should throw if amount is negative', () => {
      expect(() => Amount.create(-10)).toThrow(ValidationError);
    });

    it('should throw if amount is NaN', () => {
      expect(() => Amount.create(Number.NaN)).toThrow(ValidationError);
    });

    it('should throw if amount is Infinity', () => {
      expect(() => Amount.create(Infinity)).toThrow(ValidationError);
    });
  });

  describe('toString', () => {
    it('should return fixed 2 decimal string', () => {
      expect(Amount.create(50).toString()).toBe('50.00');
    });
  });
});
