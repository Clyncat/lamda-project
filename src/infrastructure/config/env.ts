import { z } from 'zod';

const EnvSchema = z.object({
  MPAY_MERCHANT_ID: z.string().min(1, 'MPAY_MERCHANT_ID is required'),
  MPAY_CHANNEL_SECRET: z.string().min(1, 'MPAY_CHANNEL_SECRET is required'),
  MPAY_SERVICE_ID: z.string().min(1, 'MPAY_SERVICE_ID is required'),
  MPAY_BASE_HOST: z.string().min(1, 'MPAY_BASE_HOST is required'),
  MPAY_BASE_PATH: z.string().default(''),
  MPAY_TIMEOUT_MS: z.coerce.number().positive().default(30_000),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function getEnvConfig(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return result.data;
}
