import { parseEvent } from './parseEvent.js';
import { error, ok } from './responseHelper.js';
import { MpayGatewayError } from '../../../domain/errors/MpayGatewayError.js';
import { ValidationError } from '../../../domain/errors/ValidationError.js';
import { buildContainer } from '../../../infrastructure/container.js';
import { logger } from '../../../infrastructure/logger.js';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

const { generateQrUseCase } = buildContainer();

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const requestId = event.requestContext.requestId;
  const log = logger.child({ requestId });

  log.info({ path: event.rawPath }, 'request received');

  try {
    const req = parseEvent(event);

    log.info({ orderId: req.orderId, amount: req.amount }, 'generating QR');

    const result = await generateQrUseCase.execute(req);

    log.info({ txnId: result.txnId }, 'QR generated successfully');

    return ok(result);
  } catch (err) {
    if (err instanceof ValidationError) {
      log.warn({ err: err.message }, 'validation error');
      return error(400, err.message);
    }
    if (err instanceof MpayGatewayError) {
      log.error({ err: err.message, raw: err.raw }, 'mPAY gateway error');
      return error(502, err.message);
    }

    log.error({ err }, 'unexpected error');
    return error(500, 'Internal server error');
  }
};
