import { cause } from './cause.js';
import { isError } from './is-error.js';
import { parseArgs } from './parse-args.js';
import { Options } from './types.js';

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

    // Для отладки мы отслеживаем исходное короткое сообщение (прикрепленное
    // в частности, к этой ошибке) отдельно от полного сообщения (которое
    // включает сообщения нашей цепочки причин).
    this.jse_shortmsg = parsed.shortmessage;
    this.message = parsed.shortmessage;

    // Если указана причина, запишем ссылку на нее и
    // обновим наше сообщение соответствующим образом.
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

    // Если нам дали объект со свойствами, сделаем его поверхностное копирование здесь.
    // Мы не хотим использовать глубокое копирование в случае, если здесь есть не простые
    // объекты, но мы не хотим использовать исходный объект в случае, если
    // вызывающий изменит его позже.
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

  static errorForEach(err: unknown, cb: (err: Error) => void) {
    if (!isError(err)) {
      throw new Error('err must be an Error');
    }
    if (err instanceof MultiError) {
      err.errors().forEach((e) => cb(e));
    } else {
      cb(err);
    }
  }
}

export class MultiError extends VError {
  private ase_errors: Error[];

  constructor(errors: unknown[]) {
    if (errors.some((e) => !isError(e))) {
      throw new Error('errors must be an Error list');
    }
    let name = 'MultiError';
    if (errors[0] && typeof errors[0] === 'object' && 'name' in errors[0]) {
      name = errors[0].name as string;
    }
    super({ cause: errors[0], name } as Options, 'first of %d error%s', errors.length, errors.length == 1 ? '' : 's');
    this.ase_errors = errors as unknown[] as Error[];
  }

  errors(): Error[] {
    return this.ase_errors.slice(0);
  }
}
