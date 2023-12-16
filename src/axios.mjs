import axios from "axios"
import 'dotenv/config'

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_SECRET}/setWebhook?url=${process.env.NGROK_URL}`

export default function getAxiosInstance() {
  return {
    /**
     * @param {string | undefined} method 
     * @param {*} params 
     */
    get(method, params) {
      return axios.get(`/${method}`, {
        baseURL: BASE_URL,
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