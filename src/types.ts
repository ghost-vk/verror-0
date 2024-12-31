export type Options = {
  cause?: Error;
  name?: string;
  skipCauseMessage?: boolean;
  info?: Record<string, unknown>;
  strict?: boolean;
};
