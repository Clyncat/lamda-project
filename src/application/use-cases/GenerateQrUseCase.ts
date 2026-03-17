import { ValidationError } from '../../domain/errors/ValidationError.js';
import { Amount } from '../../domain/value-objects/Amount.js';
import { OrderId } from '../../domain/value-objects/OrderId.js';

import type { IGenerateQrUseCase } from '../../domain/ports/inbound/IGenerateQrUseCase.js';
import type {
  GenerateQrRequest,
  GenerateQrResponse,
  IMpayGateway,
} from '../../domain/ports/outbound/IMpayGateway.js';

export class GenerateQrUseCase implements IGenerateQrUseCase {
  constructor(private readonly mpayGateway: IMpayGateway) {}

  async execute(req: GenerateQrRequest): Promise<GenerateQrResponse> {
    // Validate via Value Objects — throws ValidationError on bad input
    const orderId = OrderId.create(req.orderId);
    const amount = Amount.create(req.amount);

    if (!req.productName?.trim()) {
      throw new ValidationError('product_name is required');
    }

    return this.mpayGateway.generateQr({
      ...req,
      orderId: orderId.toString(),
      amount: amount.toNumber(),
    });
  }
}
