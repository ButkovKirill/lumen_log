import type { Colors } from "../Logger/colors.ts"

interface ITelegram {
    logInTelegram?: boolean,
    api?: string | undefined,
    chatsIds?: Array<number> | undefined
}

export interface ILumenOptions {
    logInFile?: boolean,
    logInFileForDebug?: boolean,
    telegram?: ITelegram,
    nameCaller?: boolean,
    nameFileCaller?: boolean,
    timeCall?: boolean,
    dateCall?: boolean,
    padding?: boolean,
    marker?: string
}

export interface ILoggerProps {
    options?: ILumenOptions,
    meta? : any[]
}

export type Color = keyof typeof Colors
export type ITheme = Record<ElementLog, Record<TypeLog, Color>>

export type Message = string | number
export type TypeLog = 'log' | 'debug' | 'ok' | 'error' | 'warn'
export type ElementLog = 'marker' | 'date' | 'caller' | 'text'