import type { Color, ILog, ILoggerProps, IMetaOptions, Message, TypeLog } from "../types/loggerTypes.js"
import { colorize, Colors } from "./colors.js"
import { getCallerInfoField, getDateAndTimeField } from "./loggerTools.js"
import { getColorForElement } from "./themes.js"
import { getConfig } from "./config.js"
import { getFilePath, getLogsFilesDirectory, printLogInFile } from "./fileManager.js"
import { sendTelegramMessage } from "./telegram.js"

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

    private static buildMeta(
        meta: unknown,
        options: IMetaOptions = {}
    ): string {
        const { colored = true } = options

        const lines: string[] = ['\n~ Data:', '{']

        const colorTypes: Record<string, Color> = {
            string: 'green',
            number: 'yellow',
            boolean: 'red',
            undefined: 'gray',
        }

        const indent = (depth: number): string => '  '.repeat(depth)

        const getType = (value: unknown): string => {
            if (value === null) return 'null'
            if (Array.isArray(value)) return 'array'

            return typeof value
        }

        const paint = (value: string, color: Color): string =>
            colored ? colorize(value, color) : value

        const formatKey = (key: string): string =>
            paint(key, 'blue') === key || !colored
                ? (colored ? colorize(colorize(key, 'blue'), 'bold') : key)
                : colorize(colorize(key, 'blue'), 'bold')

        const formatType = (type: string): string =>
            paint(`(${type})`, 'magenta')

        const formatValue = (value: unknown): string => {
            if (typeof value === 'string') return JSON.stringify(value)
            if (typeof value === 'undefined') return 'undefined'
            if (typeof value === 'bigint') return `${value}n`
            if (typeof value === 'symbol') return value.toString()

            if (typeof value === 'function') {
                return `[Function: ${value.name || 'anonymous'}]`
            }

            return String(value)
        }

        const visited = new WeakSet<object>()

        const render = (
            value: unknown,
            key: string,
            depth: number
        ): void => {
            const prefix = indent(depth)
            const formattedKey = colored
                ? colorize(colorize(key, 'blue'), 'bold')
                : key

            if (value !== null && typeof value === 'object') {
                if (visited.has(value)) {
                    lines.push(`${prefix}${formattedKey}: [Circular]`)
                    return
                }

                visited.add(value)

                try {
                    if (Array.isArray(value)) {
                        lines.push(
                            `${prefix}${formattedKey}: [ ${formatType(`array, length: ${value.length}`)}`
                        )

                        value.forEach((item, index) => {
                            render(item, `[${index}]`, depth + 1)
                        })

                        lines.push(`${prefix}]`)
                    } else {
                        lines.push(
                            `${prefix}${formattedKey}: { ${formatType('object')}`
                        )

                        for (const [childKey, childValue] of Object.entries(value)) {
                            render(childValue, childKey, depth + 1)
                        }

                        lines.push(`${prefix}}`)
                    }
                } finally {
                    visited.delete(value)
                }

                return
            }

            const type = getType(value)
            const color = colorTypes[type] ?? 'white'
            const formattedValue = paint(formatValue(value), color)

            lines.push(
                `${prefix}${formattedKey}: ${formattedValue} ${formatType(type)}`
            )
        }

        if (meta !== null && typeof meta === 'object' && !Array.isArray(meta)) {
            for (const [key, value] of Object.entries(meta)) {
                render(value, key, 1)
            }
        } else {
            render(meta, 'value', 1)
        }

        lines.push('}')

        return lines.join('\n')
    }

    private static buildLog(dataLog: ILog) {
        const colorMarker = getColorForElement('marker', dataLog.logType) 
        const colorDate = getColorForElement('date', dataLog.logType)
        const colorCaller = getColorForElement('caller', dataLog.logType)
        const colorText = getColorForElement('text', dataLog.logType)

        const {dateAndTime, callerInfo} = this.getInfo(dataLog.props)

        const separator = dateAndTime || callerInfo ? ' ' : ''

        const padding = dataLog.props?.options?.padding ?? this.config.padding ? '\n' : ''

        const markerSymbol = (dataLog.props?.options?.marker ?? this.config.marker) ?? '⏺'

        const marker = `${colorize(markerSymbol, colorMarker)} `
        const loggerType = colorize(`[${dataLog.logType.toUpperCase()}]`, colorMarker)
        const fields = `${colorize(dateAndTime, colorDate)}${separator}${colorize(callerInfo, colorCaller)}`
        const textForMessage = colorize(dataLog.message, colorText)

        const metaData = dataLog.props?.data
        const metaField = metaData ? this.buildMeta(metaData) : ''

        const text = `${padding}${marker} ${loggerType} ${fields}${separator ? '\n' : ''}${textForMessage}${metaField}${padding}`

        return text
    }

    private static buildLogWithoutColorize(dataLog: ILog) {
        const {dateAndTime, callerInfo} = this.getInfo(dataLog.props, 6)

        const separator = dateAndTime || callerInfo ? ' ' : ''

        const padding = dataLog.props?.options?.padding ?? this.config.padding ? '\n' : ''

        const marker = dataLog.props?.options?.marker ?? '⏺'
        const loggerType = `[${dataLog.logType.toUpperCase()}]`
        const fields = `${dateAndTime}${separator}${callerInfo}`

        const metaData = dataLog.props?.data
        const metaField = metaData ? this.buildMeta(metaData, { colored: false }) : ''

        const text = `${padding}${marker} ${loggerType} ${fields}${separator ? '\n' : ''}${dataLog.message}${metaField}${padding}`

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