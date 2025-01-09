import { cause } from './cause.js';
import { isError } from './is-error.js';
import { Info } from './types.js';

export const info = (err: unknown): Info => {
  if (!isError(err)) {
    throw new Error('err must be an Error');
  }
  const _cause = cause(err);
  let rv: Record<string, unknown>;
  if (_cause !== null) {
    rv = info(_cause);
  } else {
    rv = {};
  }

  if ('jse_info' in err && typeof err.jse_info == 'object' && err.jse_info !== null) {
    for (const k in err.jse_info) {
      rv[k] = err.jse_info[k];
    }
  }

  return rv;
};
