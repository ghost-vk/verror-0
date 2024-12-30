import { format } from 'node:util';

function isError(e: unknown): e is Error {
  if (!e) return false;
  return e instanceof Error;
}

type Args = {
  // Первый - ошибка / строка / объект.
  // Второй - строка / sprintf параметр.
  // Следующие - sprintf параметры.
  argv: unknown[];
};

export function parseArgs(args: Args) {
  let argv: unknown[];

  if (typeof args !== 'object' || args === null || !('argv' in args)) {
    throw new Error('args should be object');
  }

  if (!Array.isArray(args.argv)) {
    throw new Error('argv should be array');
  }

  argv = args.argv;

  const options: {
    cause?: unknown;
  } = {};
  let sprintfArgs: unknown[] = [];
  // Определим какая форма вызова используется.
  if (argv.length === 0) {
    // Тут ничего делать не нужно.
  } else if (isError(argv[0])) {
    options.cause = argv[0];
    // Слайсим все элементы как аргументы sprintf после причины/ошибки.
    sprintfArgs = argv.slice(1);
  } else if (typeof argv[0] === 'object' && argv[0] !== null) {
    for (const k in argv[0]) {
      options[k] = argv[0][k];
    }
    sprintfArgs = argv.slice(1);
  } else {
    if (typeof argv[0] !== 'string') {
      throw new Error('first argument to VError or WError constructor must be a string, object, or Error');
    }
    // В случае когда передана строка - все аргументы идут для sprintf.
    sprintfArgs = argv;
  }

  let shortmessage: string;
  if (sprintfArgs.length === 0) {
    shortmessage = '';
  } else {
    // 1й - message, остальные - параметры.
    shortmessage = format(...sprintfArgs);
  }

  return {
    options,
    shortmessage
  };
}
