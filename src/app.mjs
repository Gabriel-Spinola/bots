// LINK: https://youtu.be/COLDiMlmcoI?si=2DQRGIgKHfITKAve

// LINK - filtering: https://github.com/yagop/node-telegram-bot-api/issues/489

import fs from 'fs'
import 'dotenv/config'
import { GatewayIntentBits, Events, Client } from 'discord.js'
import command from './commands/ping.mjs'
import express from 'express'
import { getImage } from './telegram.mjs'

export const messagesMap = new Map()

const app = express()
app.use(express.json())

const chanelId = '1186041173530398841'
const interval = 1000

const client = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
]})

app.post('*', async function (req, res) {
  console.log('BODY: ', req.body)
  
  try {
    if (req.body) {
      const message = req.body.channel_post
      
      if (message.photo) {
        const data = await getImage(message.photo[2].file_id)
        console.log('IMAGE DATA:', data)

        messagesMap.set(message.message_id, { message, img: data })
      }
    }
  } catch(error) {
    console.error('Failed to receive message')
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
  let isImageSent = false

  setInterval(() => {
    const channel = client.channels.cache.get(chanelId);

    if (!channel) {
      console.error(`Channel with ID ${chanelId} not found.`)
      return
    }

    if (messagesMap.size <= 0) {
      return
    }

    const keysToDelete = []

    messagesMap.forEach((message, key) => {
      console.log('KEY: ', key)

      if (message.img) {
        (async() => {
          await channel.send({ files: [{ attachment: message.img, name: 'name.jpg' }] })
          channel.send(message.message.caption || '')
          
          fs.unlinkSync(message.img)
        })()
      }

      keysToDelete.push(key)
    })

    console.log(keysToDelete.length)

    keysToDelete.forEach((key) => {
      //fs.unlinkSync(message[key].img)
      console.log('DELETED: ', key)


      messagesMap.delete(key)
    })

    console.log(messagesMap.size)
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
