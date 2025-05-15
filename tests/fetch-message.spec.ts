import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VError } from '../src/verror.js';

describe('handle fetch error', () => {
  it('should return meaningfull dns error message', async () => {
    const { ok, error } = await wrapPromise(() => fetch('http://notarealdomain.local'));
    assert.equal(ok, false);
    assert.equal(error.message, 'fetch failed');
    const verror = new VError(error, 'app error');
    assert.equal(verror.message, 'app error: fetch failed: getaddrinfo ENOTFOUND notarealdomain.local');
  });

  it('should return meaningfull ssl error message', async () => {
    const { ok, error } = await wrapPromise(() => fetch('https://expired.badssl.com'));
    assert.equal(ok, false);
    assert.equal(error.message, 'fetch failed');
    const verror = new VError(error, 'app error');
    assert.equal(verror.message, 'app error: fetch failed: certificate has expired');
  });

  async function wrapPromise<T = any>(
    fn: () => Promise<T>
  ): Promise<{ ok: true; data: T; error?: undefined | null } | { ok: false; error: Error; data?: undefined | null }> {
    try {
      const res = await fn();
      return { ok: true, data: res };
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { ok: false, error: err };
      }
      return { ok: false, error: new Error(String(err)) };
    }
  }
});
