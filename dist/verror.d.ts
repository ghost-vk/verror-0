export declare class VError extends Error {
    name: string;
    message: string;
    protected jse_shortmsg: string;
    protected jse_cause: Error;
    protected jse_info: Record<string, unknown>;
    constructor(...args: unknown[]);
    toString(): string;
    static cause(err: unknown): Error | null;
    static info(err: unknown): Record<string, unknown>;
    static findCauseByName(err: unknown, name: string): Error | null;
    static hasCauseWithName(err: unknown, name: string): boolean;
    static fullStack(err: unknown): string | undefined;
    static errorFromList(errors: unknown[]): unknown;
    static errorForEach(err: unknown, cb: (err: Error) => void): void;
}
export declare class MultiError extends VError {
    name: string;
    private ase_errors;
    constructor(errors: unknown[]);
    errors(): Error[];
}
export declare class WError extends VError {
    name: string;
    constructor(...args: unknown[]);
    toString(): string;
}
//# sourceMappingURL=verror.d.ts.map