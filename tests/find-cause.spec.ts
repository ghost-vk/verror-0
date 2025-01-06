import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VError } from '../src/verror.js';
import { SError } from '../src/serror.js';
import { WError } from '../src/werror.js';
import { findCause, hasCause } from '../src/cause.js';

describe('find and has cause test', () => {
  // We'll build up a cause chain using each of our classes and make sure
  // that findCauseByName() traverses all the way to the bottom.  This
  // ends up testing that findCauseByName() works with each of these
  // classes.
  class MyError extends Error {
    public name = 'MyError';
  }
  const err1 = new MyError();
  const err2 = new VError(
    {
      name: 'ErrorTwo',
      cause: err1
    },
    'basic verror (number two)'
  );
  const err3 = new SError(
    {
      name: 'ErrorThree',
      cause: err2
    },
    'strict error (number three)'
  );
  const err4 = new WError(
    {
      name: 'ErrorFour',
      cause: err3
    },
    'werror (number four)'
  );

  it('top-level error should have all of the causes in its chain', () => {
    assert.equal(findCause(err4, 'ErrorFour'), err4);
    assert.equal(hasCause(err4, 'ErrorFour'), true);
    assert.equal(findCause(err4, 'ErrorThree'), err3);
    assert.equal(hasCause(err4, 'ErrorThree'), true);
    assert.equal(findCause(err4, 'ErrorTwo'), err2);
    assert.equal(hasCause(err4, 'ErrorTwo'), true);
    assert.equal(findCause(err4, 'MyError'), err1);
    assert.equal(hasCause(err4, 'MyError'), true);
  });

  it('the next-level errors should have only their own causes', () => {
    assert.equal(null, findCause(err3, 'ErrorFour'));
    assert.equal(false, hasCause(err3, 'ErrorFour'));
    assert.equal(err3, findCause(err3, 'ErrorThree'));
    assert.equal(true, hasCause(err3, 'ErrorThree'));
    assert.equal(err2, findCause(err3, 'ErrorTwo'));
    assert.equal(true, hasCause(err3, 'ErrorTwo'));
    assert.equal(err1, findCause(err3, 'MyError'));
    assert.equal(true, hasCause(err3, 'MyError'));

    assert.equal(null, findCause(err2, 'ErrorFour'));
    assert.equal(false, hasCause(err2, 'ErrorFour'));
    assert.equal(null, findCause(err2, 'ErrorThree'));
    assert.equal(false, hasCause(err2, 'ErrorThree'));
    assert.equal(err2, findCause(err2, 'ErrorTwo'));
    assert.equal(true, hasCause(err2, 'ErrorTwo'));
    assert.equal(err1, findCause(err2, 'MyError'));
    assert.equal(true, hasCause(err2, 'MyError'));
  });

  it('functions must work on non-VError errors', () => {
    assert.equal(err1, findCause(err1, 'MyError'));
    assert.equal(true, hasCause(err1, 'MyError'));
    assert.equal(null, findCause(err1, 'ErrorTwo'));
    assert.equal(false, hasCause(err1, 'ErrorTwo'));
  });

  it('returns cause even if original error is non-VError', () => {
    const subErr = new Error('root');
    subErr.name = 'RootError';
    const err = new Error('error', { cause: subErr });
    assert.equal(findCause(err, subErr.name), subErr);

    const unnamedErr = new Error('a very basic error');
    assert.equal(unnamedErr, findCause(unnamedErr, 'Error'));
  });

  it('should throw an Error when given bad argument types', () => {
    assert.throws(() => {
      findCause(null, 'AnError');
    }, new Error('err must be an Error'));
    assert.throws(() => {
      hasCause(null, 'AnError');
    }, new Error('err must be an Error'));
    assert.throws(() => {
      findCause(err1, '');
    }, new Error('name cannot be empty'));
    assert.throws(() => {
      hasCause(err1, '');
    }, new Error('name cannot be empty'));
  });
});
