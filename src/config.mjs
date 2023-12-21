import 'dotenv/config'

export const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_SECRET}/`
export const FILE_BASE_URL = `https://api.telegram.org/file/bot${process.env.TELEGRAM_SECRET}/`
