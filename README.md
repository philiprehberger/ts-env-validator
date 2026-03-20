# @philiprehberger/env-validator

[![CI](https://github.com/philiprehberger/ts-env-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-env-validator/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/env-validator.svg)](https://www.npmjs.com/package/@philiprehberger/env-validator)
[![License](https://img.shields.io/github/license/philiprehberger/ts-env-validator)](LICENSE)

Schema-based environment variable validation with type-safe accessors

## Installation

```bash
npm install @philiprehberger/env-validator
```

## Usage

```ts
import { createEnv } from '@philiprehberger/env-validator';

const env = createEnv({
  DATABASE_URL: { type: 'url', required: true },
  PORT: { type: 'port', default: 3000 },
  NODE_ENV: { type: 'enum', values: ['development', 'production', 'test'] },
  ENABLE_CACHE: { type: 'boolean', default: false },
  ADMIN_EMAIL: { type: 'email', required: true },
  MAX_CONNECTIONS: { type: 'number', default: 10 },
  FEATURE_FLAGS: { type: 'json', default: {} },
});

env.DATABASE_URL; // string (typed, validated)
env.PORT;         // number
env.ENABLE_CACHE; // boolean
```

### Supported Types

| Type | Parses to | Validation |
|------|-----------|------------|
| `string` | `string` | Any non-empty string |
| `number` | `number` | Valid number |
| `boolean` | `boolean` | true/false/1/0/yes/no |
| `url` | `string` | Valid URL |
| `email` | `string` | Valid email format |
| `enum` | `string` | One of specified `values` |
| `port` | `number` | Integer 0–65535 |
| `json` | `unknown` | Valid JSON |

### Error Reporting

All validation errors are collected and reported at once:

```ts
// If DATABASE_URL and ADMIN_EMAIL are both missing:
// EnvValidationError: Environment validation failed:
//   Missing required environment variable: DATABASE_URL
//   Missing required environment variable: ADMIN_EMAIL
```

### Custom Source

```ts
const env = createEnv(schema, {
  DATABASE_URL: 'postgres://localhost/mydb',
  PORT: '8080',
});
```

## API

### `createEnv<S extends Schema>(schema: S, source?: Record<string, string | undefined>): InferEnv<S>`

Validates environment variables against the given schema and returns a type-safe object. Throws `EnvValidationError` if any validation fails. If `source` is omitted, reads from `process.env`.

### `Schema`

A record mapping variable names to `FieldConfig` objects:

```ts
type Schema = Record<string, FieldConfig>;
```

### `FieldConfig`

| Property | Type | Description |
|----------|------|-------------|
| `type` | `'string' \| 'number' \| 'boolean' \| 'url' \| 'email' \| 'enum' \| 'port' \| 'json'` | Validation type. |
| `required` | `boolean` | Whether the variable must be present. Default: `false`. |
| `default` | Varies by type | Default value if missing. Makes the field effectively required in the output type. |
| `values` | `readonly string[]` | (enum only) Allowed values. |

### `EnvValidationError`

Thrown when one or more variables fail validation.

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Human-readable summary of all failures. |
| `errors` | `string[]` | Array of individual error messages. |

### `InferEnv<S>`

TypeScript utility type that infers the output type from a schema. Required fields and fields with defaults are non-optional; others are optional.

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
