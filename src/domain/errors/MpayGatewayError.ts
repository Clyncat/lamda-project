import { DomainError } from './DomainError.js';

export class MpayGatewayError extends DomainError {
  constructor(
    message: string,
    public readonly raw?: unknown,
  ) {
    super(message, 'MPAY_GATEWAY_ERROR');
  }
}
