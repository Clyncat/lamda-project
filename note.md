<h1>Project initialize</h1>

npm init -y

npm install -D `
  typescript `
  @types/node `
  @types/aws-lambda `
  vitest `
  @vitest/coverage-v8 `
  esbuild `
  zod `
  pino `
  @types/pino

npx tsc --init


mkdir -p src/domain/entities, `
  src/domain/value-objects, `
  src/domain/errors, `
  src/domain/ports/inbound, `
  src/domain/ports/outbound, `
  src/application/use-cases, `
  src/adapters/inbound/lambda, `
  src/adapters/outbound/mpay, `
  src/infrastructure/config, `
  tests/unit/domain/entities, `
  tests/unit/domain/value-objects, `
  tests/unit/application, `
  tests/integration/adapters



npm install -D `
  eslint@^9 `
  @eslint/js@^9 `
  typescript-eslint `
  eslint-plugin-import `
  eslint-plugin-security `
  eslint-plugin-sonarjs `
  eslint-import-resolver-typescript `
  globals `
  prettier `
  eslint-config-prettier `
  eslint-plugin-prettier `
  husky `
  lint-staged `
  @commitlint/cli `
  @commitlint/config-conventional `
  commitizen `
  cz-conventional-changelog


New-Item .prettierrc