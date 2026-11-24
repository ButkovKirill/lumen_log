export declare const Colors: {
    readonly reset: "\u001B[0m";
    readonly black: "\u001B[30m";
    readonly red: "\u001B[31m";
    readonly green: "\u001B[32m";
    readonly yellow: "\u001B[33m";
    readonly blue: "\u001B[34m";
    readonly magenta: "\u001B[35m";
    readonly cyan: "\u001B[36m";
    readonly white: "\u001B[37m";
    readonly gray: "\u001B[90m";
    readonly bold: "\u001B[1m";
    readonly underline: "\u001B[4m";
};
export declare const colorize: (text: string | number, color: keyof typeof Colors) => string;
