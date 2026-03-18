import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-config-prettier';

export default [
  // ── Global ignores ────────────────────────────────────────────
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },

  // ── Base + TypeScript ─────────────────────────────────────────
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  // ── Main rules ────────────────────────────────────────────────
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    plugins: {
      import: importPlugin,
      security,
      sonarjs,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      // ── Variables ──────────────────────────────────────────
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      // ── TypeScript ─────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',

      // ── Naming Convention ──────────────────────────────────
      '@typescript-eslint/naming-convention': [
        'error',

        // HTTP headers / external API keys ที่ต้องใช้ quotes
        // bypass naming check อัตโนมัติ
        // เช่น 'Content-Type', 'X-sdpg-nonce', 'x-api-key'
        {
          selector: 'objectLiteralProperty',
          modifiers: ['requiresQuotes'],
          format: null,
        },

        // ค่าคงที่ global → UPPER_SNAKE_CASE
        // PascalCase สำหรับ zod schema เช่น EnvSchema, BodySchema
        {
          selector: 'variable',
          modifiers: ['const', 'global'],
          format: ['UPPER_CASE', 'camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },

        // ตัวแปรทั่วไป → camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },

        // Function → camelCase (กิริยา เช่น generateQr, parseEvent)
        {
          selector: 'function',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },

        // Method → camelCase (กิริยา เช่น execute, generateQr)
        {
          selector: 'method',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },

        // Parameter → camelCase
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },

        // Class → PascalCase (คำนาม เช่น MpayHttpGateway, Amount)
        {
          selector: 'class',
          format: ['PascalCase'],
        },

        // Interface → PascalCase
        // Port interfaces ใส่ I prefix โดย convention (IMpayGateway)
        // DTO interfaces ไม่ต้อง (GenerateQrRequest, MpayConfig)
        {
          selector: 'interface',
          format: ['PascalCase'],
        },

        // Type alias → PascalCase (เช่น TxnStatus, MpayConfig)
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },

        // Enum → PascalCase (เช่น TxnStatus)
        {
          selector: 'enum',
          format: ['PascalCase'],
        },

        // Enum member → UPPER_CASE (เช่น PENDING, SUCCESS, EXPIRED)
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },

        // Property → camelCase, UPPER_CASE, snake_case, PascalCase
        // snake_case สำหรับ mPAY API response (txn_id, qr_code)
        // PascalCase สำหรับ zod schema fields
        {
          selector: 'property',
          format: ['camelCase', 'UPPER_CASE', 'snake_case', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
      ],

      // ── Imports ────────────────────────────────────────────
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // ── Code Style ─────────────────────────────────────────
      eqeqeq: ['error', 'always'],
      'no-else-return': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',

      // ── Security ───────────────────────────────────────────
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-object-injection': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-eval-with-expression': 'error',

      // ── SonarJS ────────────────────────────────────────────
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
      'sonarjs/no-identical-expressions': 'error',
    },
  },

  // ── Test files override ───────────────────────────────────────
  {
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'objectLiteralProperty',
          modifiers: ['requiresQuotes'],
          format: null,
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'property',
          format: null,
        },
      ],
    },
  },
];;;