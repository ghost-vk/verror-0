export type Info = Record<string, unknown>;

export type Options = {
  cause?: Error | null;
  name?: string;
  skipCauseMessage?: boolean;
  info?: Info;
  strict?: boolean;
  /**
   * Maximum number of nested `cause` errors to traverse when building the final error message.
   * Default: 3.
   */
  maxCauseDepth?: number;
};
