import { ValidationError } from '../errors/ValidationError.js';

export class Amount {
  private constructor(private readonly value: number) {}

  static create(raw: unknown): Amount {
    if (typeof raw !== 'number' || Number.isNaN(raw)) {
      throw new ValidationError('amount must be a number');
    }
    if (raw <= 0) {
      throw new ValidationError('amount must be greater than 0');
    }
    if (!Number.isFinite(raw)) {
      throw new ValidationError('amount must be a finite number');
    }
    // mPAY รับ 2 decimal places
    const rounded = Math.round(raw * 100) / 100;

    return new Amount(rounded);
  }

  toNumber(): number {
    return this.value;
  }

  toString(): string {
    return this.value.toFixed(2);
  }
}
