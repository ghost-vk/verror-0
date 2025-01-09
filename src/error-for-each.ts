import { isError } from './is-error.js';
import { MultiError } from './multi-error.js';

export const errorForEach = (err: unknown, cb: (err: Error) => void) => {
  if (!isError(err)) {
    throw new Error('err must be an Error');
  }
  if (err instanceof MultiError) {
    err.errors().forEach((e) => cb(e));
  } else {
    cb(err);
  }
};
