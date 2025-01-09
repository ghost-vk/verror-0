import { parseArgs } from './parse-args.js';
import { VError } from './verror.js';

/*
 * Like JavaScript's built-in Error class, but supports a "cause" argument which
 * is wrapped, not "folded in" as with VError.    Accepts a printf-style message.
 * The cause argument can be null.
 */
export class WError extends VError {
  constructor(...args: unknown[]) {
    const parsed = parseArgs({
      argv: args
    });
    const options = parsed.options;
    options.skipCauseMessage = true;
    options.name = options.name ?? 'WError';
    super(options, '%s', parsed.shortmessage);
  }

  toString(): string {
    let str = (this.hasOwnProperty('name') && this.name) || this.constructor.name || this.constructor.prototype.name;
    if (this.message) str += ': ' + this.message;
    if ('jse_cause' in this && this.jse_cause && this.jse_cause.message) {
      str += '; caused by ' + this.jse_cause.toString();
    }
    return str;
  }
}
