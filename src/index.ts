import type { Schema, InferEnv } from './types.js';
import { validateField } from './validators.js';

export type { Schema, FieldConfig, InferEnv } from './types.js';

export class EnvValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`Environment validation failed:\n  ${errors.join('\n  ')}`);
    this.name = 'EnvValidationError';
    this.errors = errors;
  }
}

export function createEnv<S extends Schema>(
  schema: S,
  source?: Record<string, string | undefined>,
): InferEnv<S> {
  const env = source ?? (typeof globalThis !== 'undefined' && 'process' in globalThis
    ? (globalThis as Record<string, unknown>).process as { env: Record<string, string | undefined> }
    : { env: {} }
  ).env;

  const errors: string[] = [];
  const result: Record<string, unknown> = {};

  for (const [key, config] of Object.entries(schema)) {
    const { value, error } = validateField(key, env[key], config);
    if (error) {
      errors.push(error);
    } else {
      result[key] = value;
    }
  }

  if (errors.length > 0) {
    throw new EnvValidationError(errors);
  }

  return result as InferEnv<S>;
}
