import type { ILoggerProps, Message, TypeLog } from "../types/loggerTypes.ts";
import { colorize } from "./colors.ts";
import { getCallerInfoField, getDateAndTimeField } from "./loggerTools.ts";
import { getColorForElement } from "./themes.ts";

export class Logger {
    // Private functions
    private static getInfo(props?: ILoggerProps) {
        const showDateAndTimeField = props ? (props.options?.dateCall || props.options?.timeCall) : true
        const showCallerField = props ? (props.options?.nameCaller || props.options?.nameFileCaller) : true
        
        const dateAndTime = showDateAndTimeField ? getDateAndTimeField() : ''
        const callerInfo = showCallerField ? getCallerInfoField() : ''

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

        const separator = dateAndTime && callerInfo ? ' ' : ''

        const text = `${colorize('⏺', colorMarker)} ${colorize(dateAndTime, colorDate)}${separator}${colorize(callerInfo, colorCaller)}${separator ? '\n' : ''}${colorize(message, colorText)}`

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