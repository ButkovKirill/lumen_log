import type { Message } from "../types/loggerTypes.ts"

interface ITelegramResponse {
    ok: boolean
    description?: string
    result?: unknown
}

export const sendTelegramMessage = async (
    message: Message,
    api: string | undefined,
    chatIds?: Array<number> | undefined
): Promise<void> => {
    if (!api) {
        throw new Error('[Lumen Log] Telegram bot token is missing')
    }

    if (!chatIds){
        throw new Error('[Lumen Log] Telegram: No chats ids')
    }

    const url = `https://api.telegram.org/bot${api}/sendMessage`

    await Promise.all(
        chatIds.map(userId => sendMessage(url, userId, message))
    )
}

const sendMessage = async (
    url: string,
    chatId: string | number,
    message: Message
) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: String(message),
        }),
    })

    const result = await response.json() as ITelegramResponse

    if (!response.ok || !result.ok) {
        throw new Error(result.description ?? 'Telegram API error')
    }
}