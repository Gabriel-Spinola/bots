import 'dotenv/config'
import axios from 'axios';

const botToken = process.env.TELEGRAM_SECRET;
const chatId = '1991964767';

console.log(botToken)

async function addBotToChat() {
  try {
    // Step 1: Export chat invite link


    const joinChatUrl = `https://api.telegram.org/bot${botToken}/joinChat?chat_id=${chatId}`;
    const joinChatData = await axios.get(joinChatUrl);

    if (joinChatData.data.ok) {
      console.log(`Bot successfully joined the chat with ID: ${chatId}`);
    } else {
      console.error('Error joining the chat:', joinChatData.data.description);
    }
  } catch (error) {
    console.error('Error:', error.message || error);
  }
}

addBotToChat();