import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const { createEnv, EnvValidationError } = await import('../../dist/index.js');

describe('string validation', () => {
  it('validates required string', () => {
    const env = createEnv({ NAME: { type: 'string', required: true } }, { NAME: 'hello' });
    assert.equal(env.NAME, 'hello');
  });

  it('throws on missing required string', () => {
    assert.throws(
      () => createEnv({ NAME: { type: 'string', required: true } }, {}),
      (err) => err instanceof EnvValidationError && err.errors.length === 1
    );
  });

  it('uses default value when missing', () => {
    const env = createEnv({ NAME: { type: 'string', default: 'world' } }, {});
    assert.equal(env.NAME, 'world');
  });

  it('treats empty string as missing', () => {
    const env = createEnv({ NAME: { type: 'string', default: 'fallback' } }, { NAME: '' });
    assert.equal(env.NAME, 'fallback');
  });
});

describe('number validation', () => {
  it('parses valid number', () => {
    const env = createEnv({ PORT: { type: 'number', required: true } }, { PORT: '3000' });
    assert.equal(env.PORT, 3000);
  });

  it('parses zero', () => {
    const env = createEnv({ VAL: { type: 'number', required: true } }, { VAL: '0' });
    assert.equal(env.VAL, 0);
  });

  it('parses negative numbers', () => {
    const env = createEnv({ VAL: { type: 'number', required: true } }, { VAL: '-5.5' });
    assert.equal(env.VAL, -5.5);
  });

  it('rejects non-numeric string', () => {
    assert.throws(
      () => createEnv({ VAL: { type: 'number', required: true } }, { VAL: 'abc' }),
      (err) => err instanceof EnvValidationError
    );
  });
});

describe('boolean validation', () => {
  for (const [input, expected] of [['true', true], ['1', true], ['yes', true], ['false', false], ['0', false], ['no', false]]) {
    it(`parses "${input}" as ${expected}`, () => {
      const env = createEnv({ FLAG: { type: 'boolean', required: true } }, { FLAG: input });
      assert.equal(env.FLAG, expected);
    });
  }

  it('is case-insensitive', () => {
    const env = createEnv({ FLAG: { type: 'boolean', required: true } }, { FLAG: 'TRUE' });
    assert.equal(env.FLAG, true);
  });

  it('rejects invalid boolean', () => {
    assert.throws(
      () => createEnv({ FLAG: { type: 'boolean', required: true } }, { FLAG: 'maybe' }),
      (err) => err instanceof EnvValidationError
    );
  });
});

describe('url validation', () => {
  it('accepts valid URL', () => {
    const env = createEnv({ URL: { type: 'url', required: true } }, { URL: 'https://example.com' });
    assert.equal(env.URL, 'https://example.com');
  });

  it('rejects invalid URL', () => {
    assert.throws(
      () => createEnv({ URL: { type: 'url', required: true } }, { URL: 'not-a-url' }),
      (err) => err instanceof EnvValidationError
    );
  });
});

describe('email validation', () => {
  it('accepts valid email', () => {
    const env = createEnv({ EMAIL: { type: 'email', required: true } }, { EMAIL: 'user@example.com' });
    assert.equal(env.EMAIL, 'user@example.com');
  });

  it('accepts email with subdomain', () => {
    const env = createEnv({ EMAIL: { type: 'email', required: true } }, { EMAIL: 'user@mail.example.com' });
    assert.equal(env.EMAIL, 'user@mail.example.com');
  });

  it('rejects email without @', () => {
    assert.throws(
      () => createEnv({ EMAIL: { type: 'email', required: true } }, { EMAIL: 'invalid' }),
      (err) => err instanceof EnvValidationError
    );
  });

  it('rejects email without domain', () => {
    assert.throws(
      () => createEnv({ EMAIL: { type: 'email', required: true } }, { EMAIL: 'user@' }),
      (err) => err instanceof EnvValidationError
    );
  });
});

describe('enum validation', () => {
  it('accepts valid enum value', () => {
    const env = createEnv(
      { ENV: { type: 'enum', values: ['dev', 'prod', 'test'], required: true } },
      { ENV: 'prod' }
    );
    assert.equal(env.ENV, 'prod');
  });

  it('rejects invalid enum value', () => {
    assert.throws(
      () => createEnv(
        { ENV: { type: 'enum', values: ['dev', 'prod'], required: true } },
        { ENV: 'staging' }
      ),
      (err) => err instanceof EnvValidationError
    );
  });
});

describe('port validation', () => {
  it('accepts valid port', () => {
    const env = createEnv({ PORT: { type: 'port', required: true } }, { PORT: '8080' });
    assert.equal(env.PORT, 8080);
  });

  it('accepts port 0', () => {
    const env = createEnv({ PORT: { type: 'port', required: true } }, { PORT: '0' });
    assert.equal(env.PORT, 0);
  });

  it('accepts port 65535', () => {
    const env = createEnv({ PORT: { type: 'port', required: true } }, { PORT: '65535' });
    assert.equal(env.PORT, 65535);
  });

  it('rejects port above 65535', () => {
    assert.throws(
      () => createEnv({ PORT: { type: 'port', required: true } }, { PORT: '70000' }),
      (err) => err instanceof EnvValidationError
    );
  });

  it('rejects non-integer port', () => {
    assert.throws(
      () => createEnv({ PORT: { type: 'port', required: true } }, { PORT: '80.5' }),
      (err) => err instanceof EnvValidationError
    );
  });

  it('rejects non-numeric port', () => {
    assert.throws(
      () => createEnv({ PORT: { type: 'port', required: true } }, { PORT: 'abc' }),
      (err) => err instanceof EnvValidationError
    );
  });
});

describe('json validation', () => {
  it('parses valid JSON object', () => {
    const env = createEnv({ DATA: { type: 'json', required: true } }, { DATA: '{"a":1}' });
    assert.deepEqual(env.DATA, { a: 1 });
  });

  it('parses valid JSON array', () => {
    const env = createEnv({ DATA: { type: 'json', required: true } }, { DATA: '[1,2,3]' });
    assert.deepEqual(env.DATA, [1, 2, 3]);
  });

  it('rejects invalid JSON', () => {
    assert.throws(
      () => createEnv({ DATA: { type: 'json', required: true } }, { DATA: '{bad' }),
      (err) => err instanceof EnvValidationError
    );
  });
});

describe('batch error collection', () => {
  it('collects multiple errors at once', () => {
    try {
      createEnv({
        A: { type: 'string', required: true },
        B: { type: 'number', required: true },
        C: { type: 'email', required: true },
      }, {});
      assert.fail('Should have thrown');
    } catch (err) {
      assert.ok(err instanceof EnvValidationError);
      assert.equal(err.errors.length, 3);
    }
  });
});

describe('custom source', () => {
  it('reads from custom source instead of process.env', () => {
    const env = createEnv(
      { KEY: { type: 'string', required: true } },
      { KEY: 'custom-value' }
    );
    assert.equal(env.KEY, 'custom-value');
  });
});
