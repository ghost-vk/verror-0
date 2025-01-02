import { describe, it } from 'node:test';
import { SError } from '../src/verror.js';
import assert from 'node:assert';

describe('serror test', () => {
  it('use strict mode by default', (_, done) => {
    try {
      const _ = new SError('%s', null);
    } catch (err) {
      assert.equal(err.message, 'strict mode violation: one or more arguments in sprintf args are null or undefined');
      done();
      return;
    }
    done('expected throw error when pass null as sprintf arg');
  });
});
