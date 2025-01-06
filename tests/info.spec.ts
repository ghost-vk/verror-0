import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VError } from '../src/verror.js';
import { cause } from '../src/cause.js';
import { info } from '../src/info.js';

describe('info test', () => {
  const err1 = new VError(
    {
      name: 'MyError',
      info: {
        errno: 'EDEADLK',
        anobject: { hello: 'world' }
      }
    },
    'bad'
  );

  it('simple info usage', () => {
    assert.equal(err1.name, 'MyError');
    assert.deepEqual(info(err1), {
      errno: 'EDEADLK',
      anobject: { hello: 'world' }
    });
  });

  it('should propagate info from nested errors', () => {
    const err2 = new VError(err1, 'worse');
    assert.equal(cause(err2), err1);
    assert.deepEqual(info(err2), {
      errno: 'EDEADLK',
      anobject: { hello: 'world' }
    });
  });

  it('should override property', () => {
    const err2 = new VError(
      {
        cause: err1,
        info: {
          anobject: { hello: 'moon' }
        }
      },
      'worse'
    );
    assert.equal(cause(err2), err1);
    assert.equal(err2.message, 'worse: bad');
    assert.deepEqual(info(err2), {
      errno: 'EDEADLK',
      anobject: { hello: 'moon' }
    });
  });

  it('should add a third-level to the chain', () => {
    const err2 = new VError(
      {
        cause: err1,
        info: {
          anobject: { hello: 'moon' }
        }
      },
      'worse'
    );
    const err3 = new VError(
      {
        cause: err2,
        name: 'BigError',
        info: {
          remote_ip: '127.0.0.1'
        }
      },
      'what next'
    );
    assert.equal(err3.name, 'BigError');
    assert.equal(cause(err3), err2);
    assert.deepEqual(info(err3), {
      errno: 'EDEADLK',
      anobject: { hello: 'moon' },
      remote_ip: '127.0.0.1'
    });
  });
});
