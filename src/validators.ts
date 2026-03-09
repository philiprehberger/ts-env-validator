import type { FieldConfig } from './types.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateField(
  key: string,
  raw: string | undefined,
  config: FieldConfig,
): { value: unknown; error?: string } {
  if (raw === undefined || raw === '') {
    if (config.default !== undefined) {
      return { value: config.default };
    }
    if (config.required) {
      return { value: undefined, error: `Missing required environment variable: ${key}` };
    }
    return { value: undefined };
  }

  switch (config.type) {
    case 'string':
      return { value: raw };

    case 'number': {
      const num = Number(raw);
      if (isNaN(num)) {
        return { value: undefined, error: `${key}: expected a number, got "${raw}"` };
      }
      return { value: num };
    }

    case 'boolean': {
      const lower = raw.toLowerCase();
      if (['true', '1', 'yes'].includes(lower)) return { value: true };
      if (['false', '0', 'no'].includes(lower)) return { value: false };
      return { value: undefined, error: `${key}: expected a boolean (true/false/1/0/yes/no), got "${raw}"` };
    }

    case 'url': {
      try {
        new URL(raw);
        return { value: raw };
      } catch {
        return { value: undefined, error: `${key}: expected a valid URL, got "${raw}"` };
      }
    }

    case 'email': {
      if (!EMAIL_RE.test(raw)) {
        return { value: undefined, error: `${key}: expected a valid email, got "${raw}"` };
      }
      return { value: raw };
    }

    case 'enum': {
      if (!config.values.includes(raw)) {
        return {
          value: undefined,
          error: `${key}: expected one of [${config.values.join(', ')}], got "${raw}"`,
        };
      }
      return { value: raw };
    }

    case 'port': {
      const port = Number(raw);
      if (!Number.isInteger(port) || port < 0 || port > 65535) {
        return { value: undefined, error: `${key}: expected a port (0-65535), got "${raw}"` };
      }
      return { value: port };
    }

    case 'json': {
      try {
        return { value: JSON.parse(raw) };
      } catch {
        return { value: undefined, error: `${key}: expected valid JSON, got "${raw}"` };
      }
    }

    default:
      return { value: raw };
  }
}
