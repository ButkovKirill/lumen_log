import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, parse } from 'node:path'
import type { ILumenOptions } from '../types/loggerTypes.ts'

const defaultConfig: ILumenOptions = {
    logInFile: false,
    nameCaller: true,
    nameFileCaller: true,
    timeCall: true,
    dateCall: true,
    padding: false,
    marker: '⏺',
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
        return defaultConfig
    }

    try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'))

        return {
            ...defaultConfig,
            ...config,
        }
    } catch (error) {
        console.error('[Lumen Log] Failed to read config:', error)
        return defaultConfig
    }
}