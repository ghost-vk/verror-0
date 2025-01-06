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

/**
 * Finds cause in stack by error name.
 *
 * @example
 * // returns PayloadTooLargeException from stack
 * findCause(err, 'PayloadTooLargeException')
 */
export function findCause(err: unknown, name: string): Error | null {
  if (!isError(err)) {
    throw new Error('err must be an Error');
  }

  if (name.length === 0) {
    throw new Error('name cannot be empty');
  }

  for (let c: Error | null = err; c !== null; c = cause(c)) {
    if (!isError(err)) continue;
    if (c.name === name) return c;
  }

  return null;
}

export function hasCause(err: unknown, name: string): boolean {
  return findCause(err, name) !== null;
}
