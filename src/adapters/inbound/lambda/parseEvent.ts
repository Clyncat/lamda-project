import { z } from 'zod';

import { ValidationError } from '../../../domain/errors/ValidationError.js';

import type { GenerateQrRequest } from '../../../domain/ports/outbound/IMpayGateway.js';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

const BodySchema = z.object({
  orderId: z.string().min(1).optional(),
  order_id: z.string().min(1).optional(),
  productName: z.string().min(1).optional(),
  product_name: z.string().min(1).optional(),
  amount: z.number().positive(),
  expireSeconds: z.number().positive().optional(),
  terminalId: z.string().optional(),
  locationName: z.string().optional(),
  custId: z.string().optional(),
  ref1: z.string().optional(),
  ref2: z.string().optional(),
});

export function parseEvent(event: APIGatewayProxyEventV2): GenerateQrRequest {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf-8')
    : (event.body ?? '{}');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ValidationError('Request body must be valid JSON');
  }

  const result = BodySchema.safeParse(parsed);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join(', ');
    throw new ValidationError(msg);
  }

  const b = result.data;
  const orderId = b.orderId ?? b.order_id;
  const productName = b.productName ?? b.product_name;

  if (!orderId) {
    throw new ValidationError('order_id is required');
  }
  if (!productName) {
    throw new ValidationError('product_name is required');
  }

  return {
    orderId,
    productName,
    amount: b.amount,
    ...(b.expireSeconds !== undefined && { expireSeconds: b.expireSeconds }),
    ...(b.terminalId !== undefined && { terminalId: b.terminalId }),
    ...(b.locationName !== undefined && { locationName: b.locationName }),
    ...(b.custId !== undefined && { custId: b.custId }),
    ...(b.ref1 !== undefined && { ref1: b.ref1 }),
    ...(b.ref2 !== undefined && { ref2: b.ref2 }),
  };
}
