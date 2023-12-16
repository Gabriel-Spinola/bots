// LINK: https://youtu.be/COLDiMlmcoI?si=2DQRGIgKHfITKAve

import 'dotenv/config'
import { GatewayIntentBits, Events, Client, REST, Routes, Message } from 'discord.js'
import command from './commands/ping.mjs'
import express from 'express'
import { getImage } from './telegram.mjs'

export const messagesMap = new Map()

const app = express()
app.use(express.json())

const chanelId = '1185317574414716981'
const interval = 500

const client = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
]})

app.post('*', async function (req, res) {
  console.log('BODY: ', req.body)

  if (req.body) {
    const message = req.body.message
    
    if (message.photo) {
      const data = await getImage(message.photo[2].file_id)
      console.log('IMAGE DATA:', data)

      messagesMap.set(message.message_id, { message, img: data })
    } else {
      messagesMap.set(message.message_id, { message })
    }
  }

  console.log('MAP SIZE:', messagesMap.size)
  res.send("none")
})

app.get('*', async function (_req, res) {
  res.send("Hello, GET")
})

app.listen(process.env.PORT || 4040, function (err) {
  if (err) {
    console.log(err)
  }

  console.log('Sever listening to port ' + 4040)
})

client.on(Events.ClientReady, (client) => {
  console.log(`Logged as ${client.user.tag}`)

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
        })()
      }

      keysToDelete.push(key)
    })

    console.log(keysToDelete.length)

    keysToDelete.forEach((key) => {
      //fs.unlinkSync(message[key].img)
      console.log('DELETED: ', key)

      messagesMap.delete(key);
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
