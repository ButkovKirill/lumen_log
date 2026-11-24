// import { existsSync, readFileSync } from 'node:fs'
// import { dirname, join, parse } from 'node:path'
// import type { ILumenOptions } from '../types/loggerTypes.js'

// const defaultConfig: ILumenOptions = {
//     logInFile: false,
//     logInFileForDebug: false,
//     telegram: {
//         logInTelegram: false,
//         api: undefined,
//         chatsIds: undefined
//     },
//     nameCaller: true,
//     nameFileCaller: true,
//     timeCall: true,
//     dateCall: true,
//     padding: false,
//     marker: '⏺',
// }

// const findConfig = (): string | null => {
//     let currentDir = process.cwd()

//     while (true) {
//         const configPath = join(currentDir, 'lumen.config.json')

//         if (existsSync(configPath)) {
//             return configPath
//         }

//         const parentDir = dirname(currentDir)

//         if (parentDir === currentDir) {
//             return null
//         }

//         currentDir = parentDir
//     }
// }

// export const getConfig = (): ILumenOptions => {
//     const configPath = findConfig()

//     if (!configPath) {
//         return defaultConfig
//     }

//     try {
//         const config = JSON.parse(readFileSync(configPath, 'utf-8'))

//         return {
//             ...defaultConfig,
//             ...config,
//         }
//     } catch (error) {
//         console.error('[Lumen Log] Failed to read config:', error)
//         return defaultConfig
//     }
// }


import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ILumenOptions } from '../types/loggerTypes.js'

const defaultConfig: ILumenOptions = {
    logInFile: false,
    logInFileForDebug: false,

    telegram: {
        logInTelegram: false,
        api: undefined,
        chatsIds: undefined,
    },

    nameCaller: true,
    nameFileCaller: true,
    timeCall: true,
    dateCall: true,
    padding: false,
    marker: '⏺',
}

const isObject = (value: unknown): value is Record<string, unknown> => {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    )
}

const findConfig = (): string | null => {
    let currentDir = process.cwd()

    while (true) {
        const configPath = join(currentDir, 'lumen.config.json')

        if (existsSync(configPath)) {
            return configPath
        }

        const parentDir = dirname(currentDir)

        if (parentDir === currentDir) {
            return null
        }

        currentDir = parentDir
    }
}

export const getConfig = (): ILumenOptions => {
    const configPath = findConfig()

    if (!configPath) {
        return { ...defaultConfig }
    }

    try {
        const fileContent = readFileSync(configPath, 'utf-8')
        const parsedConfig: unknown = JSON.parse(fileContent)

        if (!isObject(parsedConfig)) {
            throw new Error('Configuration must be a JSON object')
        }

        const telegramConfig = isObject(parsedConfig.telegram)
            ? parsedConfig.telegram
            : {}

        return {
            ...defaultConfig,
            ...parsedConfig,

            telegram: {
                ...defaultConfig.telegram,
                ...telegramConfig,
                api:
                    process.env.TELEGRAM_BOT_TOKEN ??
                    telegramConfig.api ??
                    defaultConfig?.telegram?.api,
            },
        } as ILumenOptions

    } catch (error) {
        console.error('[Lumen Log] Failed to read config:', error)

        return { ...defaultConfig }
    }
}
