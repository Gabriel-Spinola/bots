import fs from 'fs'
import 'dotenv/config'
import { GatewayIntentBits, Events, Client } from 'discord.js'
import command from './commands/ping.mjs'
import express from 'express'
import { getImage } from './telegram.mjs'
import { promoChannelId, promoCheckageInterval } from './config.mjs'

const messagesMap = new Map()

const app = express()
app.use(express.json())

const adsClient = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
  GatewayIntentBits.GuildWebhooks
]})

/**
 * @typedef { { photo: { file_id: string }[], message_id: string } } ChannelPost
 */
app.post('*', async function (req, res) {
  console.log('RECEIVED: ', req.body)
  
  try {
    if (req.body) {
      /**  @type {ChannelPost} */
      const message = req.body.channel_post
      
      if (message.photo) {
        const data = await getImage(message.photo[2].file_id)
        console.log('IMAGE DATA:', data)

        messagesMap.set(message.message_id, { message, img: data })
      }
    }
  } catch(error) {
    console.error('Failed to receive message')

    res.status(500).send("Something went wrong when trying to process a message.")
  }

  console.log('MAP SIZE:', messagesMap.size)
  res.send("POST")
})

app.get('*', async function (_req, res) {
  res.send("Hello, GET!")
})

app.listen(process.env.PORT || 3000, function (err) {
  if (err) {
    console.error(err)
  }

  console.log('Sever listening to port ' + 3000)
})

adsClient.on(Events.ClientReady, (client) => {
  console.log(`Logged as ${client.user.tag}`)

  setInterval(() => {
    const channel = client.channels.cache.get(promoChannelId);

    if (!channel) {
      console.error(`Channel with ID ${promoChannelId} not found.`)

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

    keysToDelete.forEach((key) => {
      console.log('DELETED: ', key)

      messagesMap.delete(key)
    })

    console.log('IMAGES TO PROCESS: ', messagesMap.size)
  }, promoCheckageInterval)
})

// ANCHOR - If commands are needed
adsClient.on(Events.InteractionCreate, async (interaction) => {
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

adsClient.login(process.env.DISCORD_SECRET)
