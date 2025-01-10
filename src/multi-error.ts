import { isError } from './is-error.js';
import { Options } from './types.js';
import { VError } from './verror.js';

/*
 * Represents a collection of errors for the purpose of consumers that generally
 * only deal with one error.  Callers can extract the individual errors
 * contained in this object, but may also just treat it as a normal single
 * error, in which case a summary message will be printed.
 */
export class MultiError extends VError {
  private ase_errors: Error[];

  constructor(errors: unknown[]) {
    if (errors.some((e) => !isError(e))) {
      throw new Error('errors must be an Error list');
    }
    let name = 'MultiError';
    if (errors[0] && typeof errors[0] === 'object' && 'name' in errors[0]) {
      name = errors[0].name as string;
    }
    super({ cause: errors[0], name } as Options, 'first of %d error%s', errors.length, errors.length === 1 ? '' : 's');
    this.ase_errors = errors as unknown[] as Error[];
  }

  errors(): Error[] {
    return this.ase_errors.slice(0);
  }
}
