import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { MpayHttpGateway } from '../../../src/adapters/outbound/mpay/MpayHttpGateway.js';
import { MpayGatewayError } from '../../../src/domain/errors/MpayGatewayError.js';

const BASE_HOST = 'mock-mpay.example.com';
const BASE_PATH = '/api';

const config = {
  merchantId: 'MERCHANT-001',
  channelSecret: 'test-secret',
  serviceId: 'SERVICE-001',
  baseHost: BASE_HOST,
  basePath: BASE_PATH,
  timeoutMs: 5_000,
};

const mockSuccessResponse = {
  txn_id: 'TXN-001',
  qr_code: '00020101...',
  expired_at: '2026-03-17T10:00:00Z',
};

const mockErrorResponse = {
  error_code: 'INVALID_AMOUNT',
  error_message: 'Amount is invalid',
};

// ── Setup mock server ──────────────────────────────────────────
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MpayHttpGateway', () => {
  const gateway = new MpayHttpGateway(config);

  describe('generateQr', () => {
    it('should return QR response on success', async () => {
      server.use(
        http.post(
          `https://${BASE_HOST}${BASE_PATH}/service-txn-gateway/v1/qr`,
          () => HttpResponse.json(mockSuccessResponse),
        ),
      );

      const result = await gateway.generateQr({
        orderId: 'ORD-001',
        productName: 'Coffee',
        amount: 50,
      });

      expect(result.txnId).toBe('TXN-001');
      expect(result.qrCode).toBe('00020101...');
      expect(result.expiredAt).toBe('2026-03-17T10:00:00Z');
    });

    it('should throw MpayGatewayError on mPAY error response', async () => {
      server.use(
        http.post(
          `https://${BASE_HOST}${BASE_PATH}/service-txn-gateway/v1/qr`,
          () => HttpResponse.json(mockErrorResponse),
        ),
      );

      await expect(
        gateway.generateQr({
          orderId: 'ORD-001',
          productName: 'Coffee',
          amount: -1,
        }),
      ).rejects.toThrow(MpayGatewayError);
    });

    it('should send correct headers', async () => {
      let capturedHeaders: Headers | undefined;

      server.use(
        http.post(
          `https://${BASE_HOST}${BASE_PATH}/service-txn-gateway/v1/qr`,
          ({ request }) => {
            capturedHeaders = request.headers;
            return HttpResponse.json(mockSuccessResponse);
          },
        ),
      );

      await gateway.generateQr({
        orderId: 'ORD-001',
        productName: 'Coffee',
        amount: 50,
      });

      if (!capturedHeaders) throw new Error('Headers not captured');

      expect(capturedHeaders.get('x-sdpg-merchant-id')).toBe('MERCHANT-001');
      expect(capturedHeaders.get('x-sdpg-nonce')).toBeTruthy();
      expect(capturedHeaders.get('x-sdpg-signature')).toBeTruthy();
      expect(capturedHeaders.get('content-type')).toContain('application/json');
    });

    it('should throw MpayGatewayError on network error', async () => {
      server.use(
        http.post(
          `https://${BASE_HOST}${BASE_PATH}/service-txn-gateway/v1/qr`,
          () => HttpResponse.error(),
        ),
      );

      await expect(
        gateway.generateQr({
          orderId: 'ORD-001',
          productName: 'Coffee',
          amount: 50,
        }),
      ).rejects.toThrow(MpayGatewayError);
    });

    it('should include qrCodeUrl when present', async () => {
      server.use(
        http.post(
          `https://${BASE_HOST}${BASE_PATH}/service-txn-gateway/v1/qr`,
          () =>
            HttpResponse.json({
              ...mockSuccessResponse,
              qr_code_url: 'https://mock-mpay.example.com/qr/TXN-001.png',
            }),
        ),
      );

      const result = await gateway.generateQr({
        orderId: 'ORD-001',
        productName: 'Coffee',
        amount: 50,
      });

      expect(result.qrCodeUrl).toBe(
        'https://mock-mpay.example.com/qr/TXN-001.png',
      );
    });
  });
});
