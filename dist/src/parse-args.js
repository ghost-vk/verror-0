import { format } from 'node:util';
function isError(e) {
    if (!e) return false;
    return e instanceof Error;
}
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
    let sprintf_args = [];
    // Определим какая форма вызова используется.
    if (argv.length === 0) {
    // Тут ничего делать не нужно.
    } else if (isError(argv[0])) {
        options.cause = argv[0];
        // Слайсим все элементы как аргументы sprintf после причины.
        sprintf_args = argv.slice(1);
    } else if (typeof argv[0] === 'object' && argv[0] !== null) {
        for(const k in argv[0]){
            options[k] = argv[0][k];
        }
        sprintf_args = argv.slice(1);
    } else {
        if (typeof argv[0] !== 'string') {
            throw new Error('first argument to VError or WError constructor must be a string, object, or Error');
        }
        // В случае когда передана строка - все аргументы идут для sprintf.
        sprintf_args = argv;
    }
    let shortmessage;
    if (sprintf_args.length === 0) {
        shortmessage = '';
    } else {
        // 1й - message, остальные - параметры.
        shortmessage = format(...sprintf_args);
    }
    return {
        options,
        shortmessage
    };
}

//# sourceMappingURL=parse-args.js.map