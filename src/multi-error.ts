import { isError } from './is-error.js';
import { VError } from './verror.js';

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
    super(
      { cause: errors[0], name } as verror0.Options,
      'first of %d error%s',
      errors.length,
      errors.length == 1 ? '' : 's'
    );
    this.ase_errors = errors as unknown[] as Error[];
  }

  errors(): Error[] {
    return this.ase_errors.slice(0);
  }
}
