import { isError } from './is-error.js';

export const cause = (err: unknown): Error | null => {
  if (!isError(err)) {
    throw new Error('err must be an Error');
  }
  if ('jse_cause' in err) {
    return isError(err.jse_cause) ? err.jse_cause : null;
  }
  return isError(err.cause) ? err.cause : null;
};

/**
 * Finds cause in stack by error name.
 *
 * @example
 * // Single string
 * findCause(err, 'PayloadTooLargeException');
 *
 * @example
 * // Array of names
 * findCause(err, ['PayloadTooLargeException', 'OtherError']);
 *
 * @example
 * // Set of names
 * findCause(err, new Set(['PayloadTooLargeException', 'OtherError']));
 */
export function findCause(err: unknown, name: string): Error | null;
export function findCause(err: unknown, name: Set<string>): Error | null;
export function findCause(err: unknown, name: string[]): Error | null;
export function findCause(err: unknown, name: string | Set<string> | string[]): Error | null {
  if (!isError(err)) {
    throw new Error('err must be an Error');
  }

  if (
    (typeof name === 'string' && name.length === 0) ||
    (Array.isArray(name) && name.length === 0) ||
    (name instanceof Set && name.size === 0)
  ) {
    throw new Error('name cannot be empty');
  }

  const nameSet: Set<string> = typeof name === 'string' ? new Set([name]) : Array.isArray(name) ? new Set(name) : name;

  for (let c: Error | null = err; c !== null; c = cause(c)) {
    if (nameSet.has(c.name)) return c;
  }

  return null;
}

/**
 * Check if cause in stack by error name.
 *
 * @example
 * // Single string
 * hasCause(err, 'PayloadTooLargeException');
 *
 * @example
 * // Array of names
 * hasCause(err, ['PayloadTooLargeException', 'OtherError']);
 *
 * @example
 * // Set of names
 * hasCause(err, new Set(['PayloadTooLargeException', 'OtherError']));
 */
export function hasCause(err: unknown, name: string): boolean;
export function hasCause(err: unknown, name: Set<string>): boolean;
export function hasCause(err: unknown, name: string[]): boolean;
export function hasCause(err: unknown, name: string | Set<string> | string[]): boolean {
  const result =
    typeof name === 'string'
      ? findCause(err, name)
      : Array.isArray(name)
        ? findCause(err, name)
        : name instanceof Set
          ? findCause(err, name)
          : null;

  if (result === null) {
    if (typeof name === 'string' || Array.isArray(name) || name instanceof Set) {
      return false;
    }
    throw new Error('Invalid type for name');
  }

  return true;
}
