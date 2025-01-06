import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VError } from '../src/verror.js';
import { SError } from '../src/serror.js';
import { WError } from '../src/werror.js';

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
    assert.equal(VError.findCauseByName(err4, 'ErrorFour'), err4);
    assert.equal(VError.hasCauseWithName(err4, 'ErrorFour'), true);
    assert.equal(VError.findCauseByName(err4, 'ErrorThree'), err3);
    assert.equal(VError.hasCauseWithName(err4, 'ErrorThree'), true);
    assert.equal(VError.findCauseByName(err4, 'ErrorTwo'), err2);
    assert.equal(VError.hasCauseWithName(err4, 'ErrorTwo'), true);
    assert.equal(VError.findCauseByName(err4, 'MyError'), err1);
    assert.equal(VError.hasCauseWithName(err4, 'MyError'), true);
  });

  it('the next-level errors should have only their own causes', () => {
    assert.equal(null, VError.findCauseByName(err3, 'ErrorFour'));
    assert.equal(false, VError.hasCauseWithName(err3, 'ErrorFour'));
    assert.equal(err3, VError.findCauseByName(err3, 'ErrorThree'));
    assert.equal(true, VError.hasCauseWithName(err3, 'ErrorThree'));
    assert.equal(err2, VError.findCauseByName(err3, 'ErrorTwo'));
    assert.equal(true, VError.hasCauseWithName(err3, 'ErrorTwo'));
    assert.equal(err1, VError.findCauseByName(err3, 'MyError'));
    assert.equal(true, VError.hasCauseWithName(err3, 'MyError'));

    assert.equal(null, VError.findCauseByName(err2, 'ErrorFour'));
    assert.equal(false, VError.hasCauseWithName(err2, 'ErrorFour'));
    assert.equal(null, VError.findCauseByName(err2, 'ErrorThree'));
    assert.equal(false, VError.hasCauseWithName(err2, 'ErrorThree'));
    assert.equal(err2, VError.findCauseByName(err2, 'ErrorTwo'));
    assert.equal(true, VError.hasCauseWithName(err2, 'ErrorTwo'));
    assert.equal(err1, VError.findCauseByName(err2, 'MyError'));
    assert.equal(true, VError.hasCauseWithName(err2, 'MyError'));
  });

  it('functions must work on non-VError errors', () => {
    assert.equal(err1, VError.findCauseByName(err1, 'MyError'));
    assert.equal(true, VError.hasCauseWithName(err1, 'MyError'));
    assert.equal(null, VError.findCauseByName(err1, 'ErrorTwo'));
    assert.equal(false, VError.hasCauseWithName(err1, 'ErrorTwo'));
  });

  it('returns cause even if original error is non-VError', () => {
    const subErr = new Error('root');
    subErr.name = 'RootError';
    const err = new Error('error', { cause: subErr });
    assert.equal(VError.findCauseByName(err, subErr.name), subErr);

    const unnamedErr = new Error('a very basic error');
    assert.equal(unnamedErr, VError.findCauseByName(unnamedErr, 'Error'));
  });

  it('should throw an Error when given bad argument types', () => {
    assert.throws(() => {
      VError.findCauseByName(null, 'AnError');
    }, new Error('err must be an Error'));
    assert.throws(() => {
      VError.hasCauseWithName(null, 'AnError');
    }, new Error('err must be an Error'));
    assert.throws(() => {
      VError.findCauseByName(err1, '');
    }, new Error('name cannot be empty'));
    assert.throws(() => {
      VError.hasCauseWithName(err1, '');
    }, new Error('name cannot be empty'));
  });
});
