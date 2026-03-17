import type { APIGatewayProxyResultV2 } from 'aws-lambda';

const jsonHeaders = { 'Content-Type': 'application/json' } as const;

export const ok = (data: unknown): APIGatewayProxyResultV2 => ({
  statusCode: 200,
  headers: jsonHeaders,
  body: JSON.stringify({ success: true, data }),
});

export const error = (
  status: number,
  message: unknown,
): APIGatewayProxyResultV2 => ({
  statusCode: status,
  headers: jsonHeaders,
  body: JSON.stringify({ success: false, error: message }),
});
