import { describe, expect, it } from 'vitest';

import {
  generateNonce,
  signHmacSha256,
} from '../../../../src/adapters/outbound/mpay/MpaySigner.js';

describe('MpaySigner', () => {
  describe('signHmacSha256', () => {
    it('should return hex string', () => {
      const result = signHmacSha256('secret', 'body', 'nonce');

      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should return same signature for same inputs', () => {
      const sig1 = signHmacSha256('secret', 'body', 'nonce');
      const sig2 = signHmacSha256('secret', 'body', 'nonce');

      expect(sig1).toBe(sig2);
    });

    it('should return different signature for different secret', () => {
      const sig1 = signHmacSha256('secret1', 'body', 'nonce');
      const sig2 = signHmacSha256('secret2', 'body', 'nonce');

      expect(sig1).not.toBe(sig2);
    });

    it('should return different signature for different body', () => {
      const sig1 = signHmacSha256('secret', 'body1', 'nonce');
      const sig2 = signHmacSha256('secret', 'body2', 'nonce');

      expect(sig1).not.toBe(sig2);
    });

    it('should return different signature for different nonce', () => {
      const sig1 = signHmacSha256('secret', 'body', 'nonce1');
      const sig2 = signHmacSha256('secret', 'body', 'nonce2');

      expect(sig1).not.toBe(sig2);
    });

    it('should produce known signature for known inputs', () => {
      const result = signHmacSha256('my-secret', '{"amount":50}', 'abc-123');

      expect(result).toBe(
        signHmacSha256('my-secret', '{"amount":50}', 'abc-123'),
      );
    });
  });

  describe('generateNonce', () => {
    it('should return a UUID format string', () => {
      const nonce = generateNonce();

      expect(nonce).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should return unique values each time', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).not.toBe(nonce2);
    });
  });
});
