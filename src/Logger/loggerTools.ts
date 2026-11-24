export const getDateAndTimeField = (
    showTime: boolean | undefined,
    showDate: boolean | undefined
) => {
    const dateAndTime = new Date()
    const dateInfo = {
        day: dateAndTime.getDate(),
        month: dateAndTime.getMonth(),
        year: dateAndTime.getFullYear(),
        h: dateAndTime.getHours(),
        m: dateAndTime.getMinutes(),
        s: dateAndTime.getSeconds()
    }

    const date = showDate ? `${dateInfo.day}.${dateInfo.month}.${dateInfo.year}`: ''
    const time = showTime ? `${dateInfo.h}:${dateInfo.m}:${dateInfo.s}` : ''

    const separator = date && time ? ' ' : ''

    const field = `[${date}${separator}${time}]`

    return field
}

export const getCallerInfoField = (
    showNameCaller: boolean = true,
    showFileCaller: boolean = true,
    level: number = 5
) => {
    const stack = new Error().stack?.split('\n')
    const caller = stack?.[level]?.trim()
    const match = caller?.match(/at (.*?) \((.*?):\d+:\d+\)/)

    const functionCallerName = showNameCaller ? (match?.[1] ?? 'unknown_function')+'()' : ''
    const fileCallerName = showFileCaller ? (match?.[2]?.split(/[\\/]/).pop() ?? 'unknown_file') : ''
    const separator = (functionCallerName && fileCallerName) ? ' -> ' : ''

    const field = `[${fileCallerName}${separator}${functionCallerName}]`

    return field
}