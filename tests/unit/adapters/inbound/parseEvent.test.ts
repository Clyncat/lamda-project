import { describe, expect, it } from 'vitest';

import { parseEvent } from '../../../../src/adapters/inbound/lambda/parseEvent.js';
import { ValidationError } from '../../../../src/domain/errors/ValidationError.js';

import type { APIGatewayProxyEventV2 } from 'aws-lambda';

const makeEvent = (body: unknown, isBase64 = false): APIGatewayProxyEventV2 =>
  ({
    body: isBase64
      ? Buffer.from(JSON.stringify(body)).toString('base64')
      : JSON.stringify(body),
    isBase64Encoded: isBase64,
    requestContext: { requestId: 'req-123' },
  }) as unknown as APIGatewayProxyEventV2;

describe('parseEvent', () => {
  describe('valid requests', () => {
    it('should parse minimal valid request', () => {
      const result = parseEvent(
        makeEvent({ orderId: 'ORD-001', productName: 'Coffee', amount: 50 }),
      );

      expect(result.orderId).toBe('ORD-001');
      expect(result.productName).toBe('Coffee');
      expect(result.amount).toBe(50);
    });

    it('should parse base64 encoded body', () => {
      const result = parseEvent(
        makeEvent(
          { orderId: 'ORD-001', productName: 'Coffee', amount: 50 },
          true,
        ),
      );

      expect(result.orderId).toBe('ORD-001');
    });

    // ── เพิ่ม test นี้ ──────────────────────────────────────────
    it('should handle null body with base64 encoding', () => {
      const event = {
        body: null,
        isBase64Encoded: true,
        requestContext: { requestId: 'req-123' },
      } as unknown as APIGatewayProxyEventV2;

      expect(() => parseEvent(event)).toThrow(ValidationError);
    });
    // ───────────────────────────────────────────────────────────

    it('should handle null body without base64 encoding', () => {
      const event = {
        body: null,
        isBase64Encoded: false,
        requestContext: { requestId: 'req-123' },
      } as unknown as APIGatewayProxyEventV2;

      expect(() => parseEvent(event)).toThrow(ValidationError);
    });

    it('should support order_id snake_case', () => {
      const result = parseEvent(
        makeEvent({ order_id: 'ORD-001', product_name: 'Coffee', amount: 50 }),
      );

      expect(result.orderId).toBe('ORD-001');
      expect(result.productName).toBe('Coffee');
    });

    it('should parse optional fields', () => {
      const result = parseEvent(
        makeEvent({
          orderId: 'ORD-001',
          productName: 'Coffee',
          amount: 50,
          expireSeconds: 1800,
          terminalId: 'TERM-001',
          locationName: 'Food Court A',
          custId: 'CUST-001',
          ref1: 'REF-001',
          ref2: 'REF-002',
        }),
      );

      expect(result.expireSeconds).toBe(1800);
      expect(result.terminalId).toBe('TERM-001');
      expect(result.locationName).toBe('Food Court A');
      expect(result.custId).toBe('CUST-001');
      expect(result.ref1).toBe('REF-001');
      expect(result.ref2).toBe('REF-002');
    });
  });

  describe('invalid requests', () => {
    it('should throw ValidationError for invalid JSON', () => {
      const event = {
        body: 'not-json',
        isBase64Encoded: false,
        requestContext: { requestId: 'req-123' },
      } as unknown as APIGatewayProxyEventV2;

      expect(() => parseEvent(event)).toThrow(ValidationError);
    });

    it('should throw ValidationError if orderId is missing', () => {
      expect(() =>
        parseEvent(makeEvent({ productName: 'Coffee', amount: 50 })),
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError if productName is missing', () => {
      expect(() =>
        parseEvent(makeEvent({ orderId: 'ORD-001', amount: 50 })),
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError if amount is missing', () => {
      expect(() =>
        parseEvent(makeEvent({ orderId: 'ORD-001', productName: 'Coffee' })),
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError if amount is negative', () => {
      expect(() =>
        parseEvent(
          makeEvent({ orderId: 'ORD-001', productName: 'Coffee', amount: -1 }),
        ),
      ).toThrow(ValidationError);
    });
  });
});
