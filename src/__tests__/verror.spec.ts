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

  it('throws when arg is null or undefined if strict mode', (_, done) => {
    try {
      const _ = new VError({ strict: true }, '%s', null);
    } catch (err) {
      assert.equal(err.message, 'strict mode violation: one or more arguments in sprintf args are null or undefined');
      done();
      return;
    }
    done('expected throw error when pass null as sprintf arg');
  });

  it('saves root error as cause', () => {
    const suberr = new Error('root cause');
    const err = new VError(suberr, 'error handle something');
    assert.equal(err.message, 'error handle something: root cause');
    assert.equal(VError.cause(err), suberr);
  });

  it('caused by another error, with annotation', () => {
    const suberr = new Error('root cause');
    const err = new VError(suberr, 'proximate cause: %d issues', 3);
    assert.equal(err.message, 'proximate cause: 3 issues: root cause');
    assert.equal(VError.cause(err), suberr);
  });
});
