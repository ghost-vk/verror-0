import { VError } from './verror.js';
import { ofList } from './of-list.js';

/**
 * Функция оборачивает `unknown` в `Error`. Обрабатывает случай вложенных ошибок (`AggregateError`).
 *
 * @example
 * // import VError from 'verror'
 * // import { wrap } from '@mc-edu/node-utils'
 *
 * try {
 *   // Throws error with message "database connection error"
 *   await registerTicket(10001000)
 * } catch (err) {
 *   const cause = wrap(err)
 *   // Result message:
 *   // "Error register ticket 10001000: database connection error"
 *   throw new VError(cause, 'Error register ticket %s', 10001000)
 * }
 */
export function wrap(err: unknown): Error {
  if (typeof err === 'string') {
    return new Error(err);
  }
  if (!err || typeof err !== 'object') {
    return new Error('unknown');
  }
  if (!(err instanceof Error)) {
    return new Error('unknown');
  }
  const hasErrorsProperty = 'errors' in err && Array.isArray((err as any).errors);
  const errorsNotEmpty = hasErrorsProperty && (err as any).errors.length > 0;
  if (errorsNotEmpty) {
    const multiError = ofList((err as any).errors);
    if (!multiError) {
      return new VError('unknown');
    }
    return multiError;
  }
  return err;
}
