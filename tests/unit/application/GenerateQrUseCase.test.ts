import { describe, expect, it, vi } from 'vitest';

import { GenerateQrUseCase } from '../../../src/application/use-cases/GenerateQrUseCase.js';
import { ValidationError } from '../../../src/domain/errors/ValidationError.js';

import type { IMpayGateway } from '../../../src/domain/ports/outbound/IMpayGateway.js';

const mockGateway: IMpayGateway = {
  generateQr: vi.fn(),
};

const mockResponse = {
  txnId: 'TXN-001',
  qrCode: '00020101...',
  expiredAt: '2025-01-01T00:00:00Z',
};

describe('GenerateQrUseCase', () => {
  const useCase = new GenerateQrUseCase(mockGateway);

  it('should call gateway with valid request', async () => {
    vi.mocked(mockGateway.generateQr).mockResolvedValue(mockResponse);

    const result = await useCase.execute({
      orderId: 'ORD-001',
      productName: 'Coffee',
      amount: 50,
    });

    expect(result.txnId).toBe('TXN-001');
    expect(mockGateway.generateQr).toHaveBeenCalledOnce();
  });

  it('should throw ValidationError if orderId is empty', async () => {
    await expect(
      useCase.execute({ orderId: '', productName: 'Coffee', amount: 50 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError if amount is negative', async () => {
    await expect(
      useCase.execute({
        orderId: 'ORD-001',
        productName: 'Coffee',
        amount: -1,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError if productName is empty', async () => {
    await expect(
      useCase.execute({ orderId: 'ORD-001', productName: '', amount: 50 }),
    ).rejects.toThrow(ValidationError);
  });
});
