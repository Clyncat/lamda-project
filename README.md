# mPAY QR Code Generator — AWS Lambda

A production-grade AWS Lambda function for generating mPAY PromptPay QR codes, built with **Hexagonal Architecture** (Ports & Adapters pattern).

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Reference](#api-reference)

---

## Architecture Overview

This project follows **Hexagonal Architecture** (also known as Ports & Adapters), which separates the application into three distinct layers:

```
┌─────────────────────────────────────────────────────┐
│                  Infrastructure                      │
│  ┌───────────────────────────────────────────────┐  │
│  │               Application                      │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │               Domain                    │  │  │
│  │  │  Entities · Value Objects · Ports       │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  Use Cases (orchestrate domain logic)          │  │
│  └───────────────────────────────────────────────┘  │
│  Adapters (Lambda handler, mPAY HTTP client)         │
└─────────────────────────────────────────────────────┘
```

### Core Principles

**1. Dependency Rule** — dependencies always point inward. The Domain knows nothing about HTTP, AWS, or any external library.

**2. Ports** — interfaces defined by the Domain that the outside world must implement.

```
Inbound Port  (IGenerateQrUseCase) ← Lambda handler calls this
Outbound Port (IMpayGateway)       ← Use case calls this, mPAY adapter implements it
```

**3. Adapters** — concrete implementations that connect the application to the outside world.

```
Inbound Adapter  → Lambda handler (converts API Gateway event → domain request)
Outbound Adapter → MpayHttpGateway (implements IMpayGateway via HTTPS)
```

### Why Hexagonal Architecture?

| Benefit | Example |
|---|---|
| Swap external services | Replace mPAY with Omise by creating a new adapter — domain unchanged |
| Test in isolation | Unit test use cases by mocking IMpayGateway — no HTTP calls needed |
| Clear boundaries | Bug in HTTP layer never bleeds into business logic |
| Easy onboarding | New developers read only the layer they need |

---

## Project Structure

```
lamda-project/
│
├── src/
│   ├── domain/                         # Core business logic — no external dependencies
│   │   ├── errors/
│   │   │   ├── DomainError.ts          # Abstract base error class
│   │   │   ├── ValidationError.ts      # Input validation failures
│   │   │   └── MpayGatewayError.ts     # mPAY gateway failures
│   │   ├── ports/
│   │   │   ├── inbound/
│   │   │   │   └── IGenerateQrUseCase.ts   # Contract for Lambda handler
│   │   │   └── outbound/
│   │   │       └── IMpayGateway.ts         # Contract for mPAY HTTP client
│   │   └── value-objects/
│   │       ├── Amount.ts               # Validated monetary amount (positive, 2dp)
│   │       └── OrderId.ts              # Validated order ID (alphanumeric, max 50 chars)
│   │
│   ├── application/
│   │   └── use-cases/
│   │       └── GenerateQrUseCase.ts    # Orchestrates validation + gateway call
│   │
│   ├── adapters/
│   │   ├── inbound/
│   │   │   └── lambda/
│   │   │       ├── handler.ts          # Lambda entry point
│   │   │       ├── parseEvent.ts       # API Gateway event → domain request
│   │   │       └── responseHelper.ts   # ok() / error() response builders
│   │   └── outbound/
│   │       └── mpay/
│   │           ├── MpayHttpGateway.ts       # Implements IMpayGateway via node:https
│   │           ├── MpaySigner.ts            # HMAC-SHA256 signature + nonce generation
│   │           └── MpayHttpGateway.types.ts # Raw mPAY API response shapes
│   │
│   └── infrastructure/
│       ├── config/
│       │   └── env.ts                  # Environment variable validation via zod
│       ├── container.ts                # Dependency injection wiring
│       └── logger.ts                  # Structured JSON logger via pino
│
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   │   └── value-objects/
│   │   │       ├── Amount.test.ts
│   │   │       └── OrderId.test.ts
│   │   ├── application/
│   │   │   └── GenerateQrUseCase.test.ts
│   │   └── adapters/
│   │       ├── inbound/
│   │       │   ├── parseEvent.test.ts
│   │       │   └── responseHelper.test.ts
│   │       └── outbound/
│   │           └── MpaySigner.test.ts
│   └── integration/
│       └── adapters/
│           └── MpayHttpGateway.test.ts  # Uses msw to mock mPAY HTTP server
│
├── docs/
│   └── openapi.yaml                    # OpenAPI 3.1 specification
│
├── .husky/
│   ├── pre-commit                      # Runs lint-staged
│   └── commit-msg                      # Runs commitlint
│
├── .vscode/
│   └── settings.json                   # Enforces workspace TypeScript version
│
├── esbuild.config.ts                   # Bundle config — outputs dist/handler.mjs
├── vitest.config.ts                    # Unit test config
├── vitest.integration.config.ts        # Integration test config
├── tsconfig.json                       # TypeScript compiler config
├── eslint.config.js                    # ESLint flat config (v9)
├── commitlint.config.js                # Conventional commits enforcement
├── renovate.json                       # Automated dependency updates
├── .env.example                        # Required environment variables template
└── .gitlab-ci.yml                      # CI/CD pipeline
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- AWS CLI (for deployment)

### Installation

```bash
git clone <repository-url>
cd lamda-project
npm install
```

### Setup environment variables

```bash
cp .env.example .env
# Fill in your mPAY credentials
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run build` | Bundle Lambda with esbuild → `dist/handler.mjs` |
| `npm run build:analyze` | Bundle and output `dist/meta.json` for bundle analysis |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:int` | Run integration tests |
| `npm run test:cov` | Run unit tests with coverage report |
| `npm run typecheck` | TypeScript type checking (no emit) |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier check |
| `npm run format:fix` | Prettier auto-fix |
| `npm run check` | Run typecheck + lint + format |
| `npm run security` | npm audit (high severity only) |
| `npm run commit` | Interactive conventional commit prompt |
| `npm run changelog` | Generate CHANGELOG.md from commits |
| `npm run docs:validate` | Validate OpenAPI specification |
| `npm run docs:preview` | Build API documentation HTML |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MPAY_MERCHANT_ID` | ✅ | mPAY merchant identifier |
| `MPAY_CHANNEL_SECRET` | ✅ | HMAC signing secret |
| `MPAY_SERVICE_ID` | ✅ | mPAY service identifier |
| `MPAY_BASE_HOST` | ✅ | mPAY API hostname (no protocol) |
| `MPAY_BASE_PATH` | ❌ | mPAY API base path (default: `""`) |
| `MPAY_TIMEOUT_MS` | ❌ | Request timeout in ms (default: `30000`) |
| `LOG_LEVEL` | ❌ | Pino log level (default: `info`) |

---

## Testing

### Unit Tests

Tests are isolated using mocks — no network calls, no environment variables required.

```bash
npm test
npm run test:cov
```

Coverage thresholds (enforced in CI):

| Metric | Threshold |
|---|---|
| Lines | 80% |
| Functions | 80% |
| Branches | 75% |

### Integration Tests

Uses [msw](https://mswjs.io/) to intercept HTTP calls and mock the mPAY API server.

```bash
npm run test:int
```

### Bundle Analysis

After building, upload `dist/meta.json` to [https://esbuild.github.io/analyze/](https://esbuild.github.io/analyze/) to visualize the bundle composition.

---

## Deployment

### Manual

```bash
npm run build
zip -r function.zip dist/
aws lambda update-function-code \
  --function-name <function-name> \
  --zip-file fileb://function.zip
```

### GitLab CI/CD

The pipeline runs automatically on push to `main`:

```
security → lint → test → build → deploy
```

Required GitLab CI/CD variables:

| Variable | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `AWS_DEFAULT_REGION` | Target region (e.g. `ap-southeast-1`) |
| `LAMBDA_FUNCTION_NAME` | Lambda function name to deploy |

---

## API Reference

Full OpenAPI specification is available at `docs/openapi.yaml`.

### POST /qr

Generate a PromptPay QR code.

**Request**

```json
{
  "orderId": "ORD-001",
  "productName": "Coffee",
  "amount": 50.00,
  "expireSeconds": 3600
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "txnId": "TXN-001",
    "qrCode": "00020101...",
    "qrCodeUrl": "https://...",
    "expiredAt": "2026-03-17T10:00:00Z"
  }
}
```

**Response 400** — Validation error

```json
{
  "success": false,
  "error": "order_id is required"
}
```

**Response 502** — mPAY gateway error

```json
{
  "success": false,
  "error": "mPAY error [INVALID_AMOUNT]: Amount is invalid"
}
```

---

## Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/).

Use `npm run commit` for a guided prompt, or write manually:

```bash
git commit -m "feat(domain): add amount value object with precision validation"
git commit -m "fix(mpay): handle timeout error gracefully"
git commit -m "test(application): add unit tests for generate qr use case"
```

Allowed types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

npm run prepare
git config core.hooksPath