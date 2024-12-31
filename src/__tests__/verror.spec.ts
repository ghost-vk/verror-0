import { describe, it } from 'node:test';
import { VError } from '../verror.js';
import assert from 'node:assert/strict';

describe('verror test', () => {
  it('create instance', () => {
    const verr = new VError(new Error('db error'), 'app message with param %s', 'someValue');
    assert(verr, 'should be defined');
    assert.equal(verr.message, 'app message with param someValue: db error');
  });

  it('handles undefined as string arg', () => {
    const err = new VError('undefined as string => %s', undefined);
    assert.equal(err.message, 'undefined as string => undefined');
  });

  it('handles null as string arg', () => {
    const err = new VError('null as string => %s', null);
    assert.equal(err.message, 'null as string => null');
  });
});
