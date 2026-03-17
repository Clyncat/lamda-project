export interface MpayQrPayload {
  order_id: string;
  product_name: string;
  sof: 'PROMPTPAY';
  service_id: string;
  amount: number;
  currency: 'THB';
  expire_time_seconds: number;
  terminal_id?: string;
  location_name?: string;
  cust_id?: string;
  ref_1?: string;
  ref_2?: string;
}

export interface MpayQrSuccess {
  txn_id: string;
  qr_code: string;
  qr_code_url?: string;
  expired_at: string;
}

export interface MpayQrError {
  error_code: string;
  error_message: string;
}

export type MpayQrRawResponse = MpayQrSuccess | MpayQrError;

export function isMpaySuccess(r: MpayQrRawResponse): r is MpayQrSuccess {
  return 'txn_id' in r;
}
