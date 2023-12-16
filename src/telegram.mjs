import axios from "axios";
import getAxiosInstance from "./axios.mjs";


/**

 * @param {*} messageObj 
 * @param {string} messageText 
 */
function sendMessage(messageObj, messageText) {
  return getAxiosInstance().get('sendMessage', {
    chatd_id: messageObj.chat.id,
    text: messageText
  })
}

export function handleMessage(messageObj) {
  /**
   * @type {string} messageText
   */
  const messageText = messageObj.text || ''

  if (messageText.charAt(0) === '/') {
    const command = messageText.substring(1)

    switch (command) {
      case 'start': {
        return sendMessage(messageObj, 'Hello, World!')
      }

      default: {
        return sendMessage(messageObj, "Unknow command")
      }
    }
  }

  return sendMessage(messageObj, messageText)
}