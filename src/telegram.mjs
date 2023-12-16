import axios from "axios";
import getAxiosInstance, { BASE_URL } from "./axios.mjs";

async function getImageFile(filePath) {
  try {
    const res = await axios.get(`${BASE_URL}${filePath}`)
  } catch(error) {
    console.error(error);

    return null
  }
}

/**
 * 
 * @param {string} fileId 
 */
export async function getImage(fileId) {
  try {
    const res = await axios.get(`${BASE_URL}getFile?file_id=${fileId}`)
    
    if (!res.data.ok) {
      throw new Error('respons\'s not okay')
    } 

    
  } catch (error) {
    console.error(error);
    return null
  }
}

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