import type { Color, ElementLog, ITheme, TypeLog } from "../types/loggerTypes.js";

export const getColorForElement = (element: ElementLog, typeLog: TypeLog): Color => {
    const theme: ITheme = {
        marker: {
            log: 'gray',
            debug: 'magenta',
            ok: 'green',
            error: 'red',
            warn: 'yellow',
        },
        date: {
            log: 'gray',
            debug: 'gray',
            ok: 'gray',
            error: 'gray',
            warn: 'gray',
        },
        caller: {
            log: 'gray',
            debug: 'gray',
            ok: 'gray',
            error: 'gray',
            warn: 'gray',
        },
        text: {
            log: 'white',
            debug: 'magenta',
            ok: 'green',
            error: 'red',
            warn: 'yellow',
        },
    }

    return theme[element][typeLog]
}