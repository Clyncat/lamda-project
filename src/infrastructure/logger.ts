import pino from 'pino';

export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  // Lambda รัน env นี้อยู่แล้ว
  base: {
    service: 'mpay-qr-lambda',
    env: process.env['NODE_ENV'] ?? 'production',
  },
  // ปิด timestamp ซ้ำ — CloudWatch มีให้อยู่แล้ว
  timestamp: pino.stdTimeFunctions.isoTime,
});
