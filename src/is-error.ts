export function isError(e: unknown): e is Error {
  if (!e) return false;
  return e instanceof Error;
}
