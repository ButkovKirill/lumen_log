import type { ILoggerProps, Message, TypeLog } from "../types/loggerTypes.ts"
import { colorize } from "./colors.ts"
import { getCallerInfoField, getDateAndTimeField } from "./loggerTools.ts"
import { getColorForElement } from "./themes.ts"
import { getConfig } from "./config.ts"
import { getFilePath, getLogsFilesDirectory, printLogInFile } from "./fileManager.ts"

export class Lumen {
    // Private
    private static config = getConfig()

    private static getInfo(props?: ILoggerProps, level: number = 5) {
        const dateCall = props?.options?.dateCall ?? this.config.dateCall
        const timeCall = props?.options?.timeCall ?? this.config.timeCall
        const showDateAndTimeField = dateCall || timeCall

        const nameCaller = props?.options?.nameCaller ?? this.config.nameCaller
        const fileCaller = props?.options?.nameFileCaller ?? this.config.nameFileCaller
        const showCallerField = nameCaller || fileCaller
        
        const dateAndTime = showDateAndTimeField ? getDateAndTimeField(timeCall, dateCall) : ''
        const callerInfo = showCallerField ? getCallerInfoField(nameCaller, fileCaller, level) : ''

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

    private static buildLogForFile(message: Message, typeLog: TypeLog, props?: ILoggerProps) {
        const {dateAndTime, callerInfo} = this.getInfo(props, 6)

        const separator = dateAndTime || callerInfo ? ' ' : ''

        const padding = props?.options?.padding ?? this.config.padding ? '\n' : ''

        const marker = props?.options?.marker ?? '⏺'
        const loggerType = `[${typeLog.toUpperCase()}]`
        const fields = `${dateAndTime}${separator}${callerInfo}`

        const text = `${padding}${marker} ${loggerType} ${fields}${separator ? '\n' : ''}${message}${padding}`

        return text
    }

    private static logInFile(message: Message, typeLog: TypeLog, props?: ILoggerProps) {
        const canWrite = props?.options?.logInFile ?? this.config.logInFile
        const isDebug = typeLog === 'debug'
        const isWriteDebug = props?.options?.logInFileForDebug
        
        if (!canWrite) {
            return
        }

        if (isDebug && !isWriteDebug){
            return
        }

        const directory = getLogsFilesDirectory()
        const filePath = getFilePath(typeLog, directory)
        const textForLog = this.buildLogForFile(message, typeLog, props)

        printLogInFile(filePath, textForLog)
    }

    // Public functions
    static log(message: Message, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'log', props)
        console.log(textLog)
        this.logInFile(message, 'log', props)
    }

    static debug(message: Message, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'debug', props)
        console.log(textLog)
        this.logInFile(message, 'debug', props)
    }

    static ok(message: Message, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'ok', props)
        console.log(textLog)
        this.logInFile(message, 'ok', props)
    }

    static error(message: Message, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'error', props)
        console.log(textLog)
        this.logInFile(message, 'error', props)
    }

    static warn(message: Message, props?: ILoggerProps): void {
        const textLog = this.buildLog(message, 'warn', props)
        console.log(textLog)
        this.logInFile(message, 'warn', props)
    }
}