import { ValidationError } from '../errors/ValidationError.js';

export class OrderId {
  private constructor(private readonly value: string) {}

  static create(raw: unknown): OrderId {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      throw new ValidationError('order_id must be a non-empty string');
    }

    const trimmed = raw.trim();

    if (trimmed.length > 50) {
      throw new ValidationError('order_id must not exceed 50 characters');
    }
    if (!/^[\w-]+$/.test(trimmed)) {
      throw new ValidationError(
        'order_id must contain only alphanumeric, hyphens, or underscores',
      );
    }

    return new OrderId(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
