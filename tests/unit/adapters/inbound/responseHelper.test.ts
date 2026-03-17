import { describe, expect, it } from 'vitest';

import {
  error,
  ok,
} from '../../../../src/adapters/inbound/lambda/responseHelper.js';

import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

describe('responseHelper', () => {
  describe('ok', () => {
    it('should return 200 with success true', () => {
      const result = ok({
        txnId: 'TXN-001',
      }) as APIGatewayProxyStructuredResultV2;

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body as string)).toEqual({
        success: true,
        data: { txnId: 'TXN-001' },
      });
    });

    it('should set Content-Type header', () => {
      const result = ok({}) as APIGatewayProxyStructuredResultV2;

      expect(result.headers).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('error', () => {
    it('should return given status with success false', () => {
      const result = error(
        400,
        'order_id is required',
      ) as APIGatewayProxyStructuredResultV2;

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body as string)).toEqual({
        success: false,
        error: 'order_id is required',
      });
    });

    it('should return 502 for gateway errors', () => {
      const result = error(
        502,
        'mPAY gateway error',
      ) as APIGatewayProxyStructuredResultV2;

      expect(result.statusCode).toBe(502);
    });

    it('should return 500 for internal errors', () => {
      const result = error(
        500,
        'Internal server error',
      ) as APIGatewayProxyStructuredResultV2;

      expect(result.statusCode).toBe(500);
    });
  });
});
