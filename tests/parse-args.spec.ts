import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../src/parse-args.js';

describe('parse args test', () => {
  it('handles strings args', () => {
    const { options, shortmessage } = parseArgs({
      argv: ['database connection error on port %d', 5432]
    });
    assert.equal(shortmessage, 'database connection error on port 5432');
    assert.deepEqual(options, {});
  });

  it('handles error cause', () => {
    const cause = new Error('database connection error');
    const { options, shortmessage } = parseArgs({
      argv: [cause, 'error handle something %j', { metadata: { port: 5432 } }]
    });
    assert.deepEqual(options, { cause: cause });
    assert.equal(shortmessage, 'error handle something {"metadata":{"port":5432}}');
  });

  it('handles empty args', () => {
    const { options, shortmessage } = parseArgs({ argv: [] });
    assert.deepEqual(options, {});
    assert.equal(shortmessage, '');
  });

  it('gracefully handles error when passed undefined or null when strict mode', () => {
    assert.throws(
      () => parseArgs({ argv: ['%s', null], strict: true }),
      new Error('strict mode violation: one or more arguments in sprintf args are null or undefined')
    );
  });
});
