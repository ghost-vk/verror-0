import { isError } from './is-error.js';
import { MultiError } from './verror.js';

export function ofList(errors: unknown[]): null | Error | MultiError {
  if (errors.length === 0) {
    return null;
  }

  if (errors.some((e) => !isError(e))) {
    throw new Error('errors must be an Error list');
  }

  if (errors.length == 1) {
    // The types have already been checked above.
    return errors[0] as Error;
  }

  return new MultiError(errors);
}
