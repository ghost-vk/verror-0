import { format } from 'node:util';
import { isError } from './is-error.js';
export function parseArgs(args) {
    let argv;
    if (typeof args !== 'object' || args === null || !('argv' in args)) {
        throw new Error('args should be object');
    }
    if (!Array.isArray(args.argv)) {
        throw new Error('argv should be array');
    }
    argv = args.argv;
    const options = {};
    let sprintfArgs = [];
    if (argv.length === 0) {
    }
    else if (isError(argv[0])) {
        options.cause = argv[0];
        sprintfArgs = argv.slice(1);
    }
    else if (typeof argv[0] === 'object' && argv[0] !== null) {
        for (const k in argv[0]) {
            options[k] = argv[0][k];
        }
        sprintfArgs = argv.slice(1);
    }
    else {
        if (typeof argv[0] !== 'string') {
            throw new Error('first argument to VError or WError constructor must be a string, object, or Error');
        }
        sprintfArgs = argv;
    }
    let shortmessage;
    if (sprintfArgs.length === 0) {
        shortmessage = '';
    }
    else {
        shortmessage = format(...sprintfArgs);
    }
    return {
        options,
        shortmessage
    };
}
//# sourceMappingURL=parse-args.js.map