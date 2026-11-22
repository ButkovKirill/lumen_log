import type { ILoggerProps, Message, TypeLog } from "../types/loggerTypes.ts"
import { colorize } from "./colors.ts"
import { getCallerInfoField, getDateAndTimeField } from "./loggerTools.ts"
import { getColorForElement } from "./themes.ts"
import { getConfig } from "./config.ts"

export class Lumen {
    // Private
    private static config = getConfig()

    private static getInfo(props?: ILoggerProps) {
        const dateCall = props?.options?.dateCall ?? this.config.dateCall
        const timeCall = props?.options?.timeCall ?? this.config.timeCall
        const showDateAndTimeField = dateCall || timeCall

        const nameCaller = props?.options?.nameCaller ?? this.config.nameCaller
        const fileCaller = props?.options?.nameFileCaller ?? this.config.nameFileCaller
        const showCallerField = nameCaller || fileCaller
        
        const dateAndTime = showDateAndTimeField ? getDateAndTimeField(timeCall, dateCall) : ''
        const callerInfo = showCallerField ? getCallerInfoField(nameCaller, fileCaller) : ''

        return {
            showDateAndTimeField,
            showCallerField,
            dateAndTime,
            callerInfo
        }
    }

    private static buildLog(message: Message, typeLog: TypeLog, props?: ILoggerProps) {
        const colorMarker = getColorForElement('marker', typeLog) 
        const colorDate = getColorForElement('date', typeLog)
        const colorCaller = getColorForElement('caller', typeLog)
        const colorText = getColorForElement('text', typeLog)

        const {dateAndTime, callerInfo} = this.getInfo(props)

        const separator = dateAndTime || callerInfo ? ' ' : ''

        const padding = props?.options?.padding ?? this.config.padding ? '\n' : ''

        const marker = `${colorize(props?.options?.marker ?? '⏺', colorMarker)} `
        const loggerType = colorize(`[${typeLog.toUpperCase()}]`, colorMarker)
        const fields = `${colorize(dateAndTime, colorDate)}${separator}${colorize(callerInfo, colorCaller)}`
        const textForMessage = colorize(message, colorText)

        const text = `${padding}${marker} ${loggerType} ${fields}${separator ? '\n' : ''}${textForMessage}${padding}`

        return text
    }

    // Public functions
    static log(message: string | number, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'log', props)
        console.log(textLog)
    }

    static debug(message: string | number, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'debug', props)
        console.log(textLog)
    }

    static ok(message: string | number, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'ok', props)
        console.log(textLog)
    }

    static error(message: string | number, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'error', props)
        console.log(textLog)
    }

    static warn(message: string | number, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'warn', props)
        console.log(textLog)
    }
}