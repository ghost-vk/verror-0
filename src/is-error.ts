export function isError(err: unknown): err is Error {
  if (!err) return false;
  return err instanceof Error;
}

export function hasErrors(err: unknown): err is { errors: Error[] } {
  if (!err || typeof err !== 'object') {
    return false;
  }
  if ('errors' in err && Array.isArray(err.errors) && err.errors.length) {
    if (!err.errors.length) {
      return false;
    }
    if (err.errors.some((e) => !isError(e))) {
      return false;
    }
    return true;
  }
  return false;
}
