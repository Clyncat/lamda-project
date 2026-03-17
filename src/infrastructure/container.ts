import { getEnvConfig } from './config/env.js';
import { MpayHttpGateway } from '../adapters/outbound/mpay/MpayHttpGateway.js';
import { GenerateQrUseCase } from '../application/use-cases/GenerateQrUseCase.js';

export interface Container {
  generateQrUseCase: GenerateQrUseCase;
}

export function buildContainer(): Container {
  const env = getEnvConfig();

  const mpayGateway = new MpayHttpGateway({
    merchantId: env.MPAY_MERCHANT_ID,
    channelSecret: env.MPAY_CHANNEL_SECRET,
    serviceId: env.MPAY_SERVICE_ID,
    baseHost: env.MPAY_BASE_HOST,
    basePath: env.MPAY_BASE_PATH,
    timeoutMs: env.MPAY_TIMEOUT_MS,
  });

  const generateQrUseCase = new GenerateQrUseCase(mpayGateway);

  return { generateQrUseCase };
}
