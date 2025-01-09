declare namespace verror0 {
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
    constructor(options: verror0.Options | Error, message: string, ...params: unknown[]);
    constructor(message?: string, ...params: unknown[]);
  }

  export type Info = Record<string, unknown>;
  export type Options = {
    cause?: Error | null;
    name?: string;
    skipCauseMessage?: boolean;
    info?: Info;
    strict?: boolean;
  };

  /*
   * SError is like VError, but stricter about types.  You cannot pass "null" or
   * "undefined" as string arguments to the formatter.  Since SError is only a
   * different function, not really a different class, we don't set
   * SError.prototype.name.
   */
  export class SError extends VError {}

  /*
   * Represents a collection of errors for the purpose of consumers that generally
   * only deal with one error.  Callers can extract the individual errors
   * contained in this object, but may also just treat it as a normal single
   * error, in which case a summary message will be printed.
   */
  export class MultiError extends VError {
    constructor(errors: Error[]);
    errors(): Error[];
  }

  /*
   * Like JavaScript's built-in Error class, but supports a "cause" argument which
   * is wrapped, not "folded in" as with VError.    Accepts a printf-style message.
   * The cause argument can be null.
   */
  export class WError extends VError {}

  export function cause(err: unknown): Error | null;
  export function info(err: unknown): verror0.Info;
  export function stack(err: unknown): string;
  export function findCause(err: unknown, name: string): Error | null;
  export function hasCause(err: unknown, name: string): boolean;
  export function ofList(errors: unknown[]): null | Error | verror0.MultiError;
  export function errorForEach(err: unknown, func: (err: Error) => void): void;
  export function wrap(err: unknown): Error;
}
