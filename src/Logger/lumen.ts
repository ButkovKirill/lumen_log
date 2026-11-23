import type { ILog, ILoggerProps, Message, TypeLog } from "../types/loggerTypes.ts"
import { colorize } from "./colors.ts"
import { getCallerInfoField, getDateAndTimeField } from "./loggerTools.ts"
import { getColorForElement } from "./themes.ts"
import { getConfig } from "./config.ts"
import { getFilePath, getLogsFilesDirectory, printLogInFile } from "./fileManager.ts"
import { sendTelegramMessage } from "./telegram.ts"

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

    private static buildLog(dataLog: ILog) {
        const colorMarker = getColorForElement('marker', dataLog.logType) 
        const colorDate = getColorForElement('date', dataLog.logType)
        const colorCaller = getColorForElement('caller', dataLog.logType)
        const colorText = getColorForElement('text', dataLog.logType)

        const {dateAndTime, callerInfo} = this.getInfo(dataLog.props)

        const separator = dateAndTime || callerInfo ? ' ' : ''

        const padding = dataLog.props?.options?.padding ?? this.config.padding ? '\n' : ''

        const marker = `${colorize(dataLog.props?.options?.marker ?? '⏺', colorMarker)} `
        const loggerType = colorize(`[${dataLog.logType.toUpperCase()}]`, colorMarker)
        const fields = `${colorize(dateAndTime, colorDate)}${separator}${colorize(callerInfo, colorCaller)}`
        const textForMessage = colorize(dataLog.message, colorText)

        const text = `${padding}${marker} ${loggerType} ${fields}${separator ? '\n' : ''}${textForMessage}${padding}`

        return text
    }

    private static buildLogWithoutColorize(dataLog: ILog) {
        const {dateAndTime, callerInfo} = this.getInfo(dataLog.props, 6)

        const separator = dateAndTime || callerInfo ? ' ' : ''

        const padding = dataLog.props?.options?.padding ?? this.config.padding ? '\n' : ''

        const marker = dataLog.props?.options?.marker ?? '⏺'
        const loggerType = `[${dataLog.logType.toUpperCase()}]`
        const fields = `${dateAndTime}${separator}${callerInfo}`

        const text = `${padding}${marker} ${loggerType} ${fields}${separator ? '\n' : ''}${dataLog.message}${padding}`

        return text
    }

    private static logInFile(dataLog: ILog) {
        const canWrite = dataLog.props?.options?.logInFile ?? this.config.logInFile
        const isDebug = dataLog.logType === 'debug'
        const isWriteDebug = dataLog.props?.options?.logInFileForDebug
        
        if (!canWrite) {
            return
        }

        if (isDebug && !isWriteDebug){
            return
        }

        const directory = getLogsFilesDirectory()
        const filePath = getFilePath(dataLog.logType, directory)
        const textForLog = this.buildLogWithoutColorize(dataLog)

        printLogInFile(filePath, textForLog)
    }

    private static logInTelegram(dataLog: ILog) {
        const canSend = dataLog.props?.options?.telegram?.logInTelegram ?? this.config.telegram?.logInTelegram
        const api = dataLog.props?.options?.telegram?.api ?? this.config.telegram?.api
        const chatsIds = dataLog.props?.options?.telegram?.chatsIds ?? this.config.telegram?.chatsIds

        const canSendToTelegram = canSend && api && chatsIds
        
        if (!canSendToTelegram){
            return
        }
        
        const textMessage = this.buildLogWithoutColorize(dataLog)

        sendTelegramMessage(textMessage, api, chatsIds)
    }

    // Public functions
    static log(message: Message, props?: ILoggerProps): void {
        const dataLog: ILog = {
            message,
            logType: 'log',
            props
        }
        const textLog = this.buildLog(dataLog)
        console.log(textLog)
        this.logInFile(dataLog)
        this.logInTelegram(dataLog)
    }

    static debug(message: Message, props?: ILoggerProps): void {
        const dataLog: ILog = {
            message,
            logType: 'debug',
            props
        }
        const textLog = this.buildLog(dataLog)
        console.log(textLog)
        this.logInFile(dataLog)
        this.logInTelegram(dataLog)
    }

    static ok(message: Message, props?: ILoggerProps): void {
        const dataLog: ILog = {
            message,
            logType: 'ok',
            props
        }
        const textLog = this.buildLog(dataLog)
        console.log(textLog)
        this.logInFile(dataLog)
        this.logInTelegram(dataLog)
    }

    static error(message: Message, props?: ILoggerProps): void {
        const dataLog: ILog = {
            message,
            logType: 'error',
            props
        }
        const textLog = this.buildLog(dataLog)
        console.log(textLog)
        this.logInFile(dataLog)
        this.logInTelegram(dataLog)
    }

    static warn(message: Message, props?: ILoggerProps): void {
        const dataLog: ILog = {
            message,
            logType: 'warn',
            props
        }
        const textLog = this.buildLog(dataLog)
        console.log(textLog)
        this.logInFile(dataLog)
        this.logInTelegram(dataLog)
    }
}