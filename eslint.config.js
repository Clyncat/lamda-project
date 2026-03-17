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
    },
  },
];