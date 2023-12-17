from telethon.sync import TelegramClient
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Access environment variables
api_key = os.getenv("API_KEY")
bot_token = os.getenv("BOT_TOKEN")

api_id = 'your_api_id'
api_hash = 'your_api_hash'
bot_token = 'your_bot_token'

# Replace these values with the actual values
channel_username = 'your_channel_username'
bot_username = 'your_bot_username'

client = TelegramClient('session_name', api_id, api_hash)

async def add_bot_to_channel():
  await client.connect()

  # Make sure the bot is authorized
  if not await client.is_user_authorized():
      await client.start(bot_token)

  # Get the channel entity
  channel = await client.get_entity(channel_username)

  # Add the bot to the channel
  await client(InviteToChannelRequest(channel, [bot_username]))

  await client.disconnect()

if __name__ == '__main__':
  import asyncio
  
  asyncio.run(add_bot_to_channel())