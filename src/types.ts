export type Info = Record<string, unknown>;

export type Options = {
  cause?: Error | null;
  name?: string;
  skipCauseMessage?: boolean;
  info?: Info;
  strict?: boolean;
};
