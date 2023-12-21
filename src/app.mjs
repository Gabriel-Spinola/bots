// LINK: https://youtu.be/COLDiMlmcoI?si=2DQRGIgKHfITKAve

// LINK - filtering: https://github.com/yagop/node-telegram-bot-api/issues/489
import fs from 'fs'
import 'dotenv/config'
import { GatewayIntentBits, Events, Client } from 'discord.js'
import command from './commands/ping.mjs'
import express from 'express'
import { getImage } from './telegram.mjs'

const messagesMap = new Map()
const sentMessagesMap = new Map()

const app = express()
app.use(express.json())

// 1 week
// NOTE - not promo
// const chanelId = '1186041173530398841'
const chanelId = '1186041173530398841'
const interval = 1000*30

const client = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
]})

app.post('*', async function (req, res) {
  console.log(req.originalUrl)
  console.log('BODY: ', req.body)
  
  try {
    if (req.body.channel_post) {
      const message = req.body.channel_post
      
      if (message.photo) {
        const data = await getImage(message.photo[message.photo.length - 1].file_id)
        console.log('IMAGE DATA:', data)

        messagesMap.set(message.message_id, { message, img: data })
      }
    }
    else if (req.body.edited_channel_post) {
      console.log("we're editing")
    }
  } catch(error) {
    console.error('FAILED TO RECEIVE MESSAGE:')
    console.error(error)
  }

  console.log('MAP SIZE:', messagesMap.size)
  res.send("none")
})

app.get('*', async function (_req, res) {
  res.send("Hello, GET")
})

app.listen(process.env.PORT || 3000, function (err) {
  if (err) {
    console.log(err)
  }

  console.log('Sever listening to port ' + 3000)
})

client.on(Events.ClientReady, (client) => {
  console.log(`Logged as ${client.user.tag}`)

  const channel = client.channels.cache.get(chanelId);

  if (!channel) {
    console.error(`Channel with ID ${chanelId} not found.`)
    
    return
  }

  setInterval(async () => {
    if (messagesMap.size <= 0) {
      return
    }

    for (const [key, message] of messagesMap.entries()) {
      console.log('KEY: ', key)

      try {
        const formatedMessage = (message.message.caption || '') + '\n\n** **'
    
        await channel.send({ files: [{ attachment: message.img, name: 'attachment.jpg' }] })
        const sentMessage = await channel.send(formatedMessage)
    
        if (fs.existsSync(message.img)) {
          fs.unlinkSync(message.img)
    
          console.log('REMOVED IMAGE FROM MEMORY')
        }

        messagesMap.delete(key)
        //sentMessagesMap.set(sentMessage.id, formatedMessage)
      } catch(error) {
        console.error('FAILED WHEN TRYING TO SEND THE MESSAGE')
        console.error(error)
      }
    }

    messagesMap.clear()

    console.log('MESSAGES TO DELET: ', messagesMap.size)
  }, interval)
})

// ANCHOR - If commands are needed
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
})

client.login(process.env.DISCORD_SECRET)
