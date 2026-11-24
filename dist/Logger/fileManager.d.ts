import type { Message, TypeLog } from '../types/loggerTypes.js';
export declare const getLogsFilesDirectory: () => string;
export declare const getFilePath: (typeLog: TypeLog, directory: string) => string;
export declare const printLogInFile: (pathFile: string, message: Message) => void;
