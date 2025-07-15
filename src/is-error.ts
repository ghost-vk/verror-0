export function isError(err: unknown): err is Error {
  if (!err || typeof err !== 'object') return false;

  // Native Error instance.
  if (err instanceof Error) return true;

  // Fallback: object shaped like an Error.
  return (
    'message' in err &&
    typeof err.message === 'string' &&
    // Most errors also have a name property.
    'name' in err &&
    typeof err.name === 'string'
  );
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
