import { isError } from './is-error.js';
import { parseArgs } from './parse-args.js';
export class VError extends Error {
    name = 'VError';
    message;
    jse_shortmsg;
    jse_cause;
    jse_info;
    constructor(...args) {
        const parsed = parseArgs({ argv: args ?? [] });
        if (parsed.options.name) {
            if (typeof parsed.options.name !== 'string') {
                throw new Error('error name must be a string');
            }
        }
        super(parsed.shortmessage);
        this.name = parsed.options.name ?? 'VError';
        this.jse_shortmsg = parsed.shortmessage;
        this.message = parsed.shortmessage;
        const cause = parsed.options.cause;
        if (cause) {
            if (!isError(cause)) {
                throw new Error('cause is not an Error');
            }
            this.jse_cause = cause;
            if (!parsed.options.skipCauseMessage) {
                this.message += ': ' + cause.message;
            }
        }
        this.jse_info = {};
        if (parsed.options.info) {
            for (const k in parsed.options.info) {
                this.jse_info[k] = parsed.options.info[k];
            }
        }
    }
    toString() {
        let str = (this.hasOwnProperty('name') && this.name) || this.constructor.name || this.constructor.prototype.name;
        if (this.message)
            str += ': ' + this.message;
        return str;
    }
    static cause(err) {
        if (!isError(err)) {
            throw new Error('err must be an Error');
        }
        if (!('jse_cause' in err)) {
            return null;
        }
        return isError(err.jse_cause) ? err.jse_cause : null;
    }
    static info(err) {
        if (!isError(err)) {
            throw new Error('err must be an Error');
        }
        const cause = VError.cause(err);
        let rv;
        if (cause !== null) {
            rv = VError.info(cause);
        }
        else {
            rv = {};
        }
        if ('jse_info' in err && typeof err.jse_info == 'object' && err.jse_info !== null) {
            for (const k in err.jse_info) {
                rv[k] = err.jse_info[k];
            }
        }
        return rv;
    }
    static findCauseByName(err, name) {
        if (!isError(err)) {
            throw new Error('err must be an Error');
        }
        if (name.length === 0) {
            throw new Error('name cannot be empty');
        }
        for (let cause = err; cause !== null; cause = VError.cause(cause)) {
            if (!isError(err)) {
                continue;
            }
            if (cause.name == name) {
                return cause;
            }
        }
        return null;
    }
    static hasCauseWithName(err, name) {
        return VError.findCauseByName(err, name) !== null;
    }
    static fullStack(err) {
        if (!isError(err)) {
            throw new Error('err must be an Error');
        }
        const cause = VError.cause(err);
        if (cause) {
            return err.stack + '\ncaused by: ' + VError.fullStack(cause);
        }
        return err.stack;
    }
    static errorFromList(errors) {
        if (errors.length === 0) {
            return null;
        }
        if (errors.some((e) => !isError(e))) {
            throw new Error('errors must be an Error list');
        }
        if (errors.length == 1) {
            return errors[0];
        }
        return new MultiError(errors);
    }
    static errorForEach(err, cb) {
        if (!isError(err)) {
            throw new Error('err must be an Error');
        }
        if (err instanceof MultiError) {
            err.errors().forEach((e) => cb(e));
        }
        else {
            cb(err);
        }
    }
}
export class MultiError extends VError {
    name = 'MultiError';
    ase_errors;
    constructor(errors) {
        if (errors.some((e) => !isError(e))) {
            throw new Error('errors must be an Error list');
        }
        super({ cause: errors[0] }, 'first of %d error%s', errors.length, errors.length == 1 ? '' : 's');
        this.ase_errors = errors;
    }
    errors() {
        return this.ase_errors.slice(0);
    }
}
export class WError extends VError {
    name = 'WError';
    constructor(...args) {
        const parsed = parseArgs({
            argv: args
        });
        const options = parsed.options;
        options.skipCauseMessage = true;
        super(options, '%s', parsed.shortmessage);
    }
    toString() {
        let str = (this.hasOwnProperty('name') && this.name) || this.constructor.name || this.constructor.prototype.name;
        if (this.message)
            str += ': ' + this.message;
        if ('jse_cause' in this && this.jse_cause && this.jse_cause.message) {
            str += '; caused by ' + this.jse_cause.toString();
        }
        return str;
    }
}
//# sourceMappingURL=verror.js.map