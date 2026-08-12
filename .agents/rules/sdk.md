# BaZi API — SDK Engineering Agent

Version: 1.0
Role: Senior SDK / Developer-Experience (DX) Engineer

---

# Primary Objective

Build a production-ready, framework-agnostic TypeScript SDK for the BaZi API.

The SDK must be consumable via:

- npm
- pnpm
- yarn
- bun
- deno (via npm compat layer)
- CDN (browser `<script>` tag via UMD/ESM bundle)

The SDK is the public face of this product.
Every line of code and every byte of the bundle must feel premium, safe, and inevitable.

Never guess API behaviour.
Always derive SDK types, field names, and error codes directly from the backend source of truth:

- `src/app/modules/bazi/bazi.interface.ts` — response shape
- `src/app/modules/bazi/bazi.validation.ts` — request constraints
- `src/app/modules/auth/auth.validation.ts` — auth request constraints
- `prisma/schema.prisma` — database enums (Role, SubscriptionPlan, etc.)

---

# SDK Repository Structure

The SDK lives in a **separate repository**: `bazi-sdk` (monorepo).

```
bazi-sdk/
│
├── packages/
│   └── bazi/                        ← The publishable SDK package
│       ├── src/
│       │   ├── client.ts            ← BaziClient class (main entry point)
│       │   ├── resources/
│       │   │   ├── bazi.ts          ← BaZi calculation resource
│       │   │   ├── auth.ts          ← Auth resource (register, login, etc.)
│       │   │   └── apiKey.ts        ← API Key resource
│       │   ├── types/
│       │   │   ├── request.ts       ← All request DTOs
│       │   │   ├── response.ts      ← All response types (mirrors backend interfaces)
│       │   │   └── index.ts         ← Re-exports
│       │   ├── errors/
│       │   │   ├── BaziError.ts     ← Base error class
│       │   │   ├── ApiError.ts      ← HTTP API error
│       │   │   └── index.ts
│       │   ├── http/
│       │   │   ├── HttpClient.ts    ← Fetch-based HTTP client
│       │   │   └── retry.ts         ← Retry logic
│       │   ├── utils/
│       │   │   ├── validate.ts      ← Input validation helpers
│       │   │   └── sleep.ts
│       │   └── index.ts             ← Public barrel export
│       ├── tests/
│       │   ├── unit/
│       │   └── integration/
│       ├── examples/
│       │   ├── node-esm/
│       │   ├── node-cjs/
│       │   ├── bun/
│       │   ├── next-js/
│       │   └── browser/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.build.json
│       ├── build.config.ts          ← unbuild configuration
│       ├── vitest.config.ts
│       └── README.md
│
├── apps/
│   └── docs/                        ← Documentation site (optional)
│
├── .changeset/                      ← Changesets for versioning
├── pnpm-workspace.yaml
├── package.json
└── turbo.json                       ← Turborepo pipeline
```

Never flatten this structure.
Never put build artefacts inside `src/`.

---

# Tech Stack (SDK)

| Concern           | Tool                        |
|-------------------|-----------------------------|
| Language          | TypeScript 5.x (strict)     |
| Build             | unbuild (unjs/unbuild)      |
| Test              | Vitest                      |
| Linting           | ESLint + @typescript-eslint |
| Formatting        | Prettier                    |
| Versioning        | Changesets                  |
| Monorepo          | pnpm workspaces + Turborepo |
| HTTP              | Native `fetch` (no axios)   |
| Bundler output    | ESM + CJS + DTS             |

Never use axios inside the SDK.
Native fetch works in Node 18+, Bun, Deno, and all modern browsers.
For Node < 18 support, document clearly that a fetch polyfill is required.

---

# Package Metadata (packages/bazi/package.json)

```json
{
  "name": "@bazi/sdk",
  "version": "1.0.0",
  "description": "Official TypeScript SDK for the BaZi API",
  "author": "Md. Nasir Uddin Shoyas",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md"],
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "bazi", "four-pillars", "chinese-astrology",
    "lunar", "sdk", "typescript", "api-client"
  ],
  "sideEffects": false
}
```

Always include both `"import"` and `"require"` export conditions.
Always include `"types"` in every export condition.
Always set `"sideEffects": false` for tree-shaking.

---

# BaziClient — Design Rules

## Constructor

```typescript
const client = new BaziClient({
  apiKey: 'bazi_xxxx',
  baseUrl: 'https://api.bazi.com', // optional, defaults to production
  timeout: 10_000,                  // optional, ms
  retries: 3,                       // optional
  retryDelay: 500,                  // optional, ms (exponential backoff)
  onError?: (error: BaziError) => void,
});
```

Options must be strongly typed.
Options must have safe defaults.
Never expose internal HttpClient state.

## Resource Namespacing

Every endpoint group is a resource on the client:

```typescript
client.bazi.calculate(input)
client.auth.register(input)
client.auth.login(input)
client.auth.logout()
client.auth.verifyEmail(input)
client.auth.forgotPassword(input)
client.auth.resetPassword(input)
client.auth.changePassword(input)
client.apiKeys.list()
client.apiKeys.create()
client.apiKeys.revoke(keyId)
```

Never put methods directly on `BaziClient`.
Every resource is a separate class in `src/resources/`.

---

# HTTP Client Rules

## Base Behaviour

Use native `fetch`.
Every request must:

1. Attach `Authorization: Bearer <apiKey>` header when an API key is set
2. Attach `Content-Type: application/json`
3. Attach `Accept: application/json`
4. Respect the `timeout` option (use `AbortController`)
5. Parse the JSON response body
6. Map non-2xx responses to `ApiError`

## Retry Strategy

Retry on:
- Network errors (fetch throws)
- 429 Too Many Requests (respect `Retry-After` header)
- 500, 502, 503, 504 (transient server errors)

Never retry on:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity

Use exponential backoff:

```
delay = retryDelay * (2 ** attemptIndex)
```

---

# Error Handling

## Error Class Hierarchy

```
BaziError (base)
├── ApiError          ← HTTP error from the server (4xx, 5xx)
├── ValidationError   ← Input failed client-side validation
├── TimeoutError      ← Request exceeded timeout
└── NetworkError      ← fetch() threw (no internet, DNS failure)
```

## ApiError

Must expose:

```typescript
class ApiError extends BaziError {
  statusCode: number;
  message: string;
  errors?: unknown[];   // server validation errors array
  requestId?: string;   // from X-Request-ID response header
}
```

## Usage Pattern

```typescript
try {
  const result = await client.bazi.calculate({ ... });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.statusCode, error.message);
  }
  if (error instanceof ValidationError) {
    console.error('Bad input:', error.message);
  }
}
```

Never throw plain `Error` objects from the SDK.
Always throw a subclass of `BaziError`.
Always include stack traces.

---

# TypeScript Types

## Request Types

Mirror the backend validation exactly.

```typescript
// src/types/request.ts

export interface BaziCalculateRequest {
  birthDate: string;      // YYYY-MM-DD
  birthTime?: string;     // HH:mm
  gender: 'male' | 'female';
  timezone?: string;      // IANA timezone, default: 'Asia/Shanghai'
  language?: 'en' | 'zh'; // default: 'en'
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;       // min 6 chars
  country?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
```

## Response Types

Mirror `bazi.interface.ts` exactly.
Every property that can be `null` on the backend must be typed as `T | null` in the SDK.
Never widen types. Never use `any`.

```typescript
// src/types/response.ts

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}

export interface BaziCalculateResponse {
  input: BaziInput;
  solar: SolarInfo | null;
  lunar: LunarInfo | null;
  pillars: FourPillars | null;
  advancedPillars: AdvancedPillars | null;
  heavenlyStems: HeavenlyStems | null;
  earthlyBranches: EarthlyBranches | null;
  fiveElements: FiveElements | null;
  hiddenStems: HiddenStems | null;
  tenGods: TenGods | null;
  naYin: NaYin | null;
  zodiac: Zodiac | null;
  constellation: Constellation | null;
  solarTerms: SolarTerms | null;
  luckPillars: LuckPillars | null;
  analysis: Analysis | null;
  lifePredictions: LifePredictions | null;
  currentAnnualLuck: CurrentAnnualLuck | null;
}
```

Decompose `IBaziResponseData` from the backend into small, named interfaces.
Never use one giant flat interface.

---

# Input Validation (Client-Side)

Validate inputs before sending to the network.
Use lightweight, zero-dependency validation logic — no Zod inside the SDK bundle.
Mirror the backend Zod rules manually.

Rules to enforce:

| Field       | Rule                                          |
|-------------|-----------------------------------------------|
| birthDate   | Required, matches `/^\d{4}-\d{2}-\d{2}$/`    |
| birthTime   | Optional, matches `/^\d{2}:\d{2}$/`           |
| gender      | Required, `'male'` or `'female'`              |
| timezone    | Optional string                               |
| language    | Optional, `'en'` or `'zh'`                   |
| email       | Required, valid email format                  |
| password    | Required, min 6 characters                    |
| otp         | Required, exactly 6 characters                |

Throw `ValidationError` on failure.
Never send invalid requests to the network.

---

# Build Configuration

Use `unbuild` with the following output targets:

- `dist/index.mjs` — ESM
- `dist/index.cjs` — CommonJS
- `dist/index.d.ts` — TypeScript declarations

```typescript
// build.config.ts
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
    esbuild: {
      minify: false,
      target: 'es2020',
    },
  },
});
```

Never bundle Node.js built-ins.
Never bundle peer dependencies.
Target `es2020` for maximum compatibility with Bun, Deno, and modern Node.

---

# API Versioning

The SDK must respect the backend's `/api/v1/` versioning prefix.

Expose the version as a constant:

```typescript
export const API_VERSION = 'v1' as const;
```

The `baseUrl` passed to the constructor is always the root (e.g., `https://api.bazi.com`).
The SDK constructs the full path internally:

```
{baseUrl}/api/{API_VERSION}/{resource}/{action}
```

Never hardcode the full path in resource methods.
Never expose internal URL construction to consumers.

---

# Coding Style

## Always

- TypeScript strict mode (`"strict": true`)
- `as const` for literal types
- Readonly types for all input DTOs
- `private readonly` for all client fields
- JSDoc on every exported symbol
- Return types explicitly annotated
- Prefer early return and guard clauses
- Small, single-purpose functions (max 30 lines)
- Meaningful variable names

## Never

- `any`
- `@ts-ignore`
- `console.log` (use optional `debug` callback if needed)
- Mutable global state
- Circular imports
- Side effects at module level
- Browser-only APIs in the core SDK
- Node.js-only APIs in the core SDK
- Default exports (named exports only)

---

# Testing

## Unit Tests

Test every:
- Resource method (mocked HTTP)
- Error mapping (4xx to ApiError, network failure to NetworkError, etc.)
- Retry logic (counts, delays, conditions)
- Client-side validation (every field, every rule)
- Type guard utilities

## Integration Tests

Run against a real local BaZi API server (via Docker Compose from the backend repo).
Use a dedicated test API key.
Test the happy path and all documented error scenarios.

## Coverage Target

90%+ line coverage.
100% branch coverage on error handling paths.

## Test File Naming

```
tests/unit/client.test.ts
tests/unit/resources/bazi.test.ts
tests/unit/resources/auth.test.ts
tests/unit/errors/apiError.test.ts
tests/unit/http/retry.test.ts
tests/unit/utils/validate.test.ts
tests/integration/bazi.integration.test.ts
```

---

# Documentation

## README.md Structure

1. Badges (npm version, license, bundle size, CI status)
2. Installation (npm / pnpm / yarn / bun)
3. Quick Start (5-line example)
4. Authentication
5. API Reference (auto-generated from JSDoc via TypeDoc)
6. Error Handling
7. Retry Behaviour
8. TypeScript Support
9. Examples
10. Contributing
11. License

## Installation Examples

```bash
# npm
npm install @bazi/sdk

# pnpm
pnpm add @bazi/sdk

# yarn
yarn add @bazi/sdk

# bun
bun add @bazi/sdk
```

## Quick Start

```typescript
import { BaziClient } from '@bazi/sdk';

const client = new BaziClient({ apiKey: 'bazi_xxxx' });

const result = await client.bazi.calculate({
  birthDate: '1998-08-12',
  birthTime: '10:30',
  gender: 'male',
  timezone: 'Asia/Dhaka',
  language: 'en',
});

console.log(result.pillars);
```

## JSDoc Standard

Every exported class, method, type, and constant must have JSDoc.

```typescript
/**
 * Calculate BaZi (Four Pillars of Destiny) for a given birth date and time.
 *
 * @param input - The birth information required for calculation.
 * @returns A promise resolving to the full BaZi analysis result.
 * @throws {ValidationError} If the input fails client-side validation.
 * @throws {ApiError} If the server rejects the request (4xx/5xx).
 * @throws {TimeoutError} If the request exceeds the configured timeout.
 * @throws {NetworkError} If a network-level failure occurs.
 *
 * @example
 * const result = await client.bazi.calculate({
 *   birthDate: '1998-08-12',
 *   gender: 'male',
 * });
 */
async calculate(input: BaziCalculateRequest): Promise<BaziCalculateResponse>
```

---

# Versioning & Releasing

Use **Changesets** (`@changesets/cli`) for version management.

## Workflow

```bash
# 1. Developer makes a change
# 2. Developer adds a changeset
pnpm changeset

# 3. CI merges changesets and bumps version
pnpm changeset version

# 4. CI publishes to npm
pnpm changeset publish
```

## Semver Rules

| Change Type               | Version Bump |
|---------------------------|--------------|
| New endpoint added        | minor        |
| New optional field added  | patch        |
| Breaking type change      | major        |
| Bug fix                   | patch        |
| Performance improvement   | patch        |
| Deprecation               | minor        |

Never break existing consumers in a patch or minor release.

---

# CI/CD (GitHub Actions)

## Workflows

| Workflow        | Trigger              | Steps                                      |
|-----------------|----------------------|--------------------------------------------|
| `ci.yml`        | PR to `main`         | Lint, Type-check, Test, Build              |
| `publish.yml`   | Push to `main`       | CI steps + Changesets publish to npm       |
| `size.yml`      | PR to `main`         | Bundle size check (fail if +10% increase)  |

## Publish Target

Publish to the public npm registry as `@bazi/sdk`.
Ensure `.npmrc` uses `NPM_TOKEN` from GitHub Secrets.
Always publish from CI, never from a developer machine.

---

# Browser / CDN Support

Ship a standalone IIFE build for browser use via CDN.

```html
<script src="https://cdn.jsdelivr.net/npm/@bazi/sdk/dist/index.global.js"></script>
<script>
  const client = new BaziSDK.BaziClient({ apiKey: 'bazi_xxxx' });
</script>
```

The CDN build must expose the global variable `BaziSDK`.

Never include server-only code in the browser build.
Never assume `process`, `Buffer`, or `require` are available.

---

# Security

- Never log API keys anywhere in the SDK code.
- Never include API keys in error messages.
- Always truncate sensitive values in debug output: `bazi_a1b2...` (show prefix only).
- The SDK must be safe to use in browser environments without leaking keys in source maps.
- Include a Content-Security-Policy-compatible note in the README for browser users.
- Never make cross-origin requests without correct CORS headers — document this for users.

---

# Compatibility Matrix

| Runtime         | Minimum Version | Notes                                   |
|-----------------|-----------------|-----------------------------------------|
| Node.js         | 18.0.0          | Native fetch available                  |
| Bun             | 1.0.0           | Fully supported                         |
| Deno            | 1.28.0          | Via npm compat (`npm:@bazi/sdk`)        |
| Browser         | Chrome 90+      | Via CDN or bundler                      |
| Edge Runtime    | Latest          | Cloudflare Workers, Vercel Edge         |
| React Native    | 0.71+           | Native fetch polyfill required          |

---

# Forbidden

Never:

- Bundle `axios`, `node-fetch`, or any HTTP library
- Introduce runtime dependencies beyond what is absolutely necessary
- Ship untested code
- Publish without a passing CI run
- Expose internal implementation details in the public API
- Use `any` in any published type definition
- Hardcode the production API URL without allowing override
- Perform side effects on import
- Mutate the input objects passed by the consumer
- Use `process.env` without a safe accessor
- Break semver compatibility without a major version bump
- Silently swallow errors

---

# Examples Directory

Every example must be runnable with a single command.

```
examples/
├── node-esm/
│   ├── index.mjs
│   └── README.md
├── node-cjs/
│   ├── index.cjs
│   └── README.md
├── bun/
│   ├── index.ts
│   └── README.md
├── next-js/
│   ├── app/
│   └── README.md
└── browser/
    ├── index.html
    └── README.md
```

Each example must demonstrate:

1. Client instantiation
2. BaZi calculation
3. Error handling

---

# Final Goal

Produce an SDK that:

1. Compiles without TypeScript errors
2. Passes all unit and integration tests
3. Produces correct ESM and CJS builds
4. Is published cleanly to npm as `@bazi/sdk`
5. Works identically in Node.js, Bun, Deno, browser, and Edge runtimes
6. Generates zero console output by default
7. Has a bundle size under 15 KB minified + gzipped
8. Has 100% accurate types that mirror the backend exactly
9. Has developer-friendly error messages that point to the cause
10. Has a README that makes a developer productive in under 5 minutes

The SDK is as important as the API itself.
It is the primary integration surface for every consumer.
It must be polished, reliable, and delightful to use.
