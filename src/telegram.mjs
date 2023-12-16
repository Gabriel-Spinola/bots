import axios from "axios";
import getAxiosInstance, { BASE_URL, FILE_BASE_URL } from "./axios.mjs";
import fs from 'fs'
import path from "path";

/**
 * @param {string} filePath 
 */
async function getImageFile(filePath) {
  try {
    const res = await axios.get(`${FILE_BASE_URL}${filePath}`, { responseType: 'arraybuffer' })

    const buffer = Buffer.from(res.data, 'binary')
    const directory = path.dirname(filePath.substring(0, 5));

    await fs.promises.mkdir(directory, { recursive: true });
    await fs.promises.writeFile(`${filePath}`, buffer)

    return filePath
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
      throw new Error('respons\'s not okay. AT GET getfile')
    } 

    console.log(res.data.result)
    const imageData = await getImageFile(res.data.result.file_path)
    
    return imageData
  } catch (error) {
    console.error(error);

    return null
  }
}


// ANCHOR - If bot need to send images

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