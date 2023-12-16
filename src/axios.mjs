import axios from "axios"
import 'dotenv/config'

export const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_SECRET}/`
export const FILE_BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_SECRET}/`
export const WEBHOOK_URL = `${BASE_URL}setWebhook?url=${process.env.NGROK_URL}`

export default function getAxiosInstance() {
  return {
    /**
     * @param {string | undefined} method 
     * @param {*} params 
     */
    get(method, params) {
      return axios.get(`/${method}`, {
        baseURL: WEBHOOK_URL,
        params,
      })
    },
    
    /**
     * 
     * @param {string | undefined} method 
     * @param {*} data 
     */
    post(method, data) {}
  }
}