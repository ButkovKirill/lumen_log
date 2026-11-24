import type { ILoggerProps, Message } from "../types/loggerTypes.js";
export declare class Lumen {
    private static config;
    private static getInfo;
    private static buildMeta;
    private static buildLog;
    private static buildLogWithoutColorize;
    private static logInFile;
    private static logInTelegram;
    static log(message: Message, props?: ILoggerProps): void;
    static debug(message: Message, props?: ILoggerProps): void;
    static ok(message: Message, props?: ILoggerProps): void;
    static error(message: Message, props?: ILoggerProps): void;
    static warn(message: Message, props?: ILoggerProps): void;
}
