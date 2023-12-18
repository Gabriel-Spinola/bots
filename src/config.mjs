import 'dotenv/config'

export const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_SECRET}/`
export const FILE_BASE_URL = `https://api.telegram.org/file/bot${process.env.TELEGRAM_SECRET}/`
export const WEBHOOK_URL = `${BASE_URL}setWebhook?url=${process.env.NGROK_URL}`

export const promoChannelId = '1186041173530398841'
export const promoCheckageInterval = 5000