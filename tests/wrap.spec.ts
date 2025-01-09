import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wrap } from '../src/wrap.js';
import { VError } from '../src/verror.js';

describe('wrap test', () => {
  it('wraps aggregation error', () => {
    const e = new AggregateError([
      new Error('database connection refused addr=127.0.0.1:5432'),
      new Error('database connection refused addr=localhost:5432')
    ]);
    const cause = wrap(e);
    const resultError = new VError(cause, 'Error register ticket, input=%j', { ticketId: 10001000, serviceID: 123 });
    assert.equal(
      resultError.message,
      'Error register ticket, input={"ticketId":10001000,"serviceID":123}: first of 2 errors: database connection refused addr=127.0.0.1:5432'
    );
  });

  it('wraps simple error', () => {
    const e = new Error('database connection refused');
    const cause = wrap(e);
    const resultError = new VError(cause, 'Error register ticket id=%s', 10001000);
    assert.equal(resultError.message, 'Error register ticket id=10001000: database connection refused');
  });

  it('wraps when throw string', () => {
    // Некоторые библиотеки выбрасывают ошибки в виде строк.
    const e = 'reference error';
    const cause = wrap(e);
    const resultError = new VError(cause, 'Error generate certificate');
    assert.equal(resultError.message, 'Error generate certificate: reference error');
  });
});
