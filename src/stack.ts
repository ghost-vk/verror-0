import { cause } from './cause.js';
import { isError } from './is-error.js';

export function stack(err: unknown): string | undefined {
  if (!isError(err)) {
    throw new Error('err must be an Error');
  }

  const c = cause(err);

  if (c) {
    return err.stack + '\ncaused by: ' + stack(c);
  }

  return err.stack;
}
