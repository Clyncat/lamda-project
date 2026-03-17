import { describe, expect, it } from 'vitest';

import { ValidationError } from '../../../../src/domain/errors/ValidationError.js';
import { OrderId } from '../../../../src/domain/value-objects/OrderId.js';

describe('OrderId', () => {
  describe('create', () => {
    it('should create valid order id', () => {
      const orderId = OrderId.create('ORD-001');
      expect(orderId.toString()).toBe('ORD-001');
    });

    it('should trim whitespace', () => {
      const orderId = OrderId.create('  ORD-001  ');
      expect(orderId.toString()).toBe('ORD-001');
    });

    it('should throw if empty string', () => {
      expect(() => OrderId.create('')).toThrow(ValidationError);
    });

    it('should throw if not a string', () => {
      expect(() => OrderId.create(123)).toThrow(ValidationError);
      expect(() => OrderId.create(null)).toThrow(ValidationError);
    });

    it('should throw if exceeds 50 characters', () => {
      expect(() => OrderId.create('a'.repeat(51))).toThrow(ValidationError);
    });

    it('should throw if contains invalid characters', () => {
      expect(() => OrderId.create('ORD 001')).toThrow(ValidationError);
      expect(() => OrderId.create('ORD@001')).toThrow(ValidationError);
    });

    it('should allow alphanumeric, hyphens, underscores', () => {
      expect(() => OrderId.create('ORD_001-ABC')).not.toThrow();
    });
  });
});
