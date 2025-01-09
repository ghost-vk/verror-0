import { cause } from './cause.js';
import { isError } from './is-error.js';

export const stack = (err: unknown): string => {
  if (!isError(err)) {
    throw new Error('err must be an Error');
  }

  const c = cause(err);

  if (c) {
    return err.stack + '\ncaused by: ' + stack(c);
  }

  return err.stack ?? '';
};
