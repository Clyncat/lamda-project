import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/infrastructure/**',
        'src/domain/ports/**',
        'src/adapters/inbound/lambda/handler.ts',
        'src/adapters/outbound/mpay/MpayHttpGateway.ts',
        'src/adapters/outbound/mpay/MpayHttpGateway.types.ts',
        'src/domain/errors/MpayGatewayError.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
});
