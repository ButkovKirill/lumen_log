import type { Colors } from "../Logger/colors.ts"

export interface ILoggerOptions {
    logInFile?: boolean,
    nameCaller?: boolean,
    nameFileCaller?: boolean,
    timeCall?: boolean,
    dateCall?: boolean
}

export interface ILoggerProps {
    options?: ILoggerOptions,
    meta? : any[]
}

export type Color = keyof typeof Colors
export type ITheme = Record<ElementLog, Record<TypeLog, Color>>

export type Message = string | number
export type TypeLog = 'log' | 'debug' | 'ok' | 'error' | 'warn'
export type ElementLog = 'marker' | 'date' | 'caller' | 'text'