import { format } from 'node:util';
import { hasErrors, isError } from './is-error.js';
import { parseArgs } from './parse-args.js';
import { Options } from './types.js';
import { cause, findCause, hasCause } from './cause.js';
import { info } from './info.js';
import { stack } from './stack.js';

/*
 * VError([cause], fmt[, arg...]): Like JavaScript's built-in Error class, but
 * supports a "cause" argument (another error) and a printf-style message.  The
 * cause argument can be null or omitted entirely.
 *
 * Examples:
 *
 * CODE                                    MESSAGE
 * new VError('something bad happened')    "something bad happened"
 * new VError('missing file: "%s"', file)  "missing file: "/etc/passwd"
 *   with file = '/etc/passwd'
 * new VError(err, 'open failed')          "open failed: file not found"
 *   with err.message = 'file not found'
 */
export class VError extends Error {
  public message: string;

  protected jse_shortmsg: string;
  protected jse_cause: Error;
  protected jse_info: Record<string, unknown>;

  constructor(options: Options | Error, message: string, ...params: unknown[]);
  constructor(message?: string, ...params: unknown[]);
  constructor(...args: unknown[]) {
    const parsed = parseArgs({ argv: args ?? [] });

    if (parsed.options.name) {
      if (typeof parsed.options.name !== 'string') {
        throw new Error('error name must be a string');
      }
    }

    super(parsed.shortmessage);

    this.name = parsed.options.name ?? 'VError';

    // For debugging, we keep track of the original short message (attached
    // this Error particularly) separately from the complete message (which
    // includes the messages of our cause chain).
    this.jse_shortmsg = parsed.shortmessage;
    this.message = parsed.shortmessage;

    // If we've been given a cause, record a reference to it and update our
    // message appropriately.
    const cause = parsed.options.cause;
    if (cause) {
      if (!isError(cause)) {
        throw new Error('cause is not an Error');
      }

      const isAggregate = hasErrors(cause);

      this.jse_cause = cause;

      if (!parsed.options.skipCauseMessage) {
        if (isAggregate) {
          this.name = parsed.options.name ?? (cause.errors[0].name as string) ?? 'VError';
          this.message += format(': first of %d error%s', cause.errors.length, cause.errors.length === 1 ? '' : 's');
          this.message += ': ' + cause.errors[0].message;
        } else {
          this.message += ': ' + cause.message;

          let depth = 1;
          let subcause = cause.cause;
          while (subcause && depth < (parsed.options.maxCauseDepth ?? 3)) {
            if (isError(subcause)) {
              this.message += ': ' + subcause.message;
              subcause = subcause.cause;
              depth++;
            } else {
              break;
            }
          }
        }
      }
    }

    // If we've been given an object with properties, shallow-copy that
    // here.  We don't want to use a deep copy in case there are non-plain
    // objects here, but we don't want to use the original object in case
    // the caller modifies it later.
    this.jse_info = {};
    if (parsed.options.info) {
      for (const k in parsed.options.info) {
        this.jse_info[k] = parsed.options.info[k];
      }
    }
  }

  toString(): string {
    let str = (this.hasOwnProperty('name') && this.name) || this.constructor.name || this.constructor.prototype.name;
    if (this.message) str += ': ' + this.message;
    return str;
  }

  // Static methods
  //
  // These class-level methods are provided so that callers can use them on
  // instances of Errors that are not VErrors.  New interfaces should be provided
  // only using static methods to eliminate the class of programming mistake where
  // people fail to check whether the Error object has the corresponding methods.

  /**
   * Link to {@link cause}. For compatibility with original verror.
   */
  static cause = cause;

  /**
   * Link to {@link info}. For compatibility with original verror.
   */
  static info = info;

  /**
   * Finds cause in stack by error name.
   * Link to {@link findCause}. For compatibility with original verror.
   *
   * @example
   * // Single string
   * VError.findCauseByName(err, 'PayloadTooLargeException');
   *
   * @example
   * // Array of names
   * VError.findCauseByName(err, ['PayloadTooLargeException', 'OtherError']);
   *
   * @example
   * // Set of names
   * VError.findCauseByName(err, new Set(['PayloadTooLargeException', 'OtherError']));
   */
  static findCauseByName = findCause;

  /**
   * Check if cause exists in stack by error name.
   * Link to {@link hasCause}. For compatibility with original verror.
   *
   * @example
   * // Single string
   * VError.hasCauseWithName(err, 'PayloadTooLargeException');
   *
   * @example
   * // Array of names
   * VError.hasCauseWithName(err, ['PayloadTooLargeException', 'OtherError']);
   *
   * @example
   * // Set of names
   * VError.hasCauseWithName(err, new Set(['PayloadTooLargeException', 'OtherError']));
   */
  static hasCauseWithName = hasCause;

  /**
   * Link to {@link stack}. For compatibility with original verror.
   */
  static fullStack = stack;
}
