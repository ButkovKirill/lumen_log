import type { Message } from "../types/loggerTypes.js";
export declare const sendTelegramMessage: (message: Message, api: string | undefined, chatIds?: Array<number> | undefined) => Promise<void>;
