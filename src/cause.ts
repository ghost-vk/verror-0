import { isError } from './is-error.js';

export function cause(err: unknown): Error | null {
  if (!isError(err)) {
    throw new Error('err must be an Error');
  }
  if ('jse_cause' in err) {
    return isError(err.jse_cause) ? err.jse_cause : null;
  }
  return isError(err.cause) ? err.cause : null;
}
