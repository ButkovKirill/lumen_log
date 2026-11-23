import fs, { type NoParamCallback } from 'fs'
import path from 'path'
import type { Message, TypeLog } from '../types/loggerTypes.ts'

export const getLogsFilesDirectory = (): string => {
    console.log('start search logs directory')
    const dir = process.cwd() + '/logs'

    return dir
}

export const getFilePath = (typeLog: TypeLog, directory: string): string => {
    const date = new Date().toLocaleDateString()
    const dir = path.join(directory, typeLog)

    fs.mkdirSync(dir, {recursive: true})

    const filePath = `${dir}/${date}.log`

    try {
        fs.writeFileSync(filePath, '', { flag: 'wx' })
    } catch (error: any) {
        if (error.code !== 'EEXIST') {
            throw error
        }
    }

    return filePath
}

export const printLogInFile = (pathFile: string, message: Message): void => {
    fs.appendFileSync(pathFile, message.toString()+'\n', 'utf-8')
}