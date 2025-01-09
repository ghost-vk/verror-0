import { parseArgs } from './parse-args.js';
import { VError } from './verror.js';

/*
 * SError is like VError, but stricter about types.  You cannot pass "null" or
 * "undefined" as string arguments to the formatter.  Since SError is only a
 * different function, not really a different class, we don't set
 * SError.prototype.name.
 */
export class SError extends VError {
  constructor(...args: unknown[]) {
    const parsed = parseArgs({
      argv: args,
      strict: true
    });
    parsed.options.name = parsed.options.name ?? 'SError';
    super(parsed.options, '%s', parsed.shortmessage);
  }
}
