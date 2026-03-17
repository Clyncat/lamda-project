import crypto from 'node:crypto';

export function signHmacSha256(
  secret: string,
  body: string,
  nonce: string,
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(body + nonce)
    .digest('hex');
}

export function generateNonce(): string {
  return crypto.randomUUID();
}
