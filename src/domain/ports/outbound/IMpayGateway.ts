export interface GenerateQrRequest {
  orderId: string;
  productName: string;
  amount: number;
  sofType?: 'PROMPTPAY';
  expireSeconds?: number;
  terminalId?: string;
  locationName?: string;
  custId?: string;
  ref1?: string;
  ref2?: string;
}

export interface GenerateQrResponse {
  txnId: string;
  qrCode: string;
  qrCodeUrl?: string;
  expiredAt: string;
}

export interface IMpayGateway {
  generateQr(req: GenerateQrRequest): Promise<GenerateQrResponse>;
}
export interface GenerateQrRequest {
  orderId: string;
  productName: string;
  amount: number;
  sofType?: 'PROMPTPAY';
  expireSeconds?: number;
  terminalId?: string;
  locationName?: string;
  custId?: string;
  ref1?: string;
  ref2?: string;
}

export interface GenerateQrResponse {
  txnId: string;
  qrCode: string;
  qrCodeUrl?: string;
  expiredAt: string;
}

export interface IMpayGateway {
  generateQr(req: GenerateQrRequest): Promise<GenerateQrResponse>;
}
