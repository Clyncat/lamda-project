import https from 'node:https';

import {
  isMpaySuccess,
  type MpayQrPayload,
  type MpayQrRawResponse,
} from './MpayHttpGateway.types.js';
import { generateNonce, signHmacSha256 } from './MpaySigner.js';
import { MpayGatewayError } from '../../../domain/errors/MpayGatewayError.js';

import type {
  GenerateQrRequest,
  GenerateQrResponse,
  IMpayGateway,
} from '../../../domain/ports/outbound/IMpayGateway.js';

export interface MpayConfig {
  merchantId: string;
  channelSecret: string;
  serviceId: string;
  baseHost: string;
  basePath: string;
  timeoutMs?: number;
}

export class MpayHttpGateway implements IMpayGateway {
  private readonly timeoutMs: number;

  constructor(private readonly config: MpayConfig) {
    this.timeoutMs = config.timeoutMs ?? 30_000;
  }

  async generateQr(req: GenerateQrRequest): Promise<GenerateQrResponse> {
    const payload: MpayQrPayload = {
      order_id: req.orderId,
      product_name: req.productName,
      sof: req.sofType ?? 'PROMPTPAY',
      service_id: this.config.serviceId,
      amount: req.amount,
      currency: 'THB',
      expire_time_seconds: req.expireSeconds ?? 3600,
      ...(req.terminalId && { terminal_id: req.terminalId }),
      ...(req.locationName && { location_name: req.locationName }),
      ...(req.custId && { cust_id: req.custId }),
      ...(req.ref1 && { ref_1: req.ref1 }),
      ...(req.ref2 && { ref_2: req.ref2 }),
    };

    const body = JSON.stringify(payload);
    const path = `${this.config.basePath}/service-txn-gateway/v1/qr`;
    const raw = await this.post(path, body);

    if (!isMpaySuccess(raw)) {
      throw new MpayGatewayError(
        `mPAY error [${raw.error_code}]: ${raw.error_message}`,
        raw,
      );
    }

    return {
      txnId: raw.txn_id,
      qrCode: raw.qr_code,
      expiredAt: raw.expired_at,
      ...(raw.qr_code_url !== undefined && { qrCodeUrl: raw.qr_code_url }),
    };
  }

  private post(path: string, body: string): Promise<MpayQrRawResponse> {
    return new Promise((resolve, reject) => {
      const nonce = generateNonce();
      const signature = signHmacSha256(this.config.channelSecret, body, nonce);

      const options: https.RequestOptions = {
        hostname: this.config.baseHost,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Content-Length': Buffer.byteLength(body),
          'X-sdpg-merchant-id': this.config.merchantId,
          'X-sdpg-nonce': nonce,
          'X-sdpg-signature': signature,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data) as MpayQrRawResponse);
          } catch {
            reject(new MpayGatewayError(`mPAY parse error: ${data}`));
          }
        });
      });

      req.on('error', (err) =>
        reject(
          new MpayGatewayError(`mPAY request failed: ${err.message}`, err),
        ),
      );

      req.setTimeout(this.timeoutMs, () => {
        req.destroy();
        reject(new MpayGatewayError('mPAY request timeout'));
      });

      req.write(body);
      req.end();
    });
  }
}
