// LINK: https://youtu.be/COLDiMlmcoI?si=2DQRGIgKHfITKAve

// LINK - TELEGRAM BOT PACKAGE: https://www.npmjs.com/package/node-telegram-bot-api
import fs from 'fs'
import 'dotenv/config'
import { GatewayIntentBits, Events, Client, Message } from 'discord.js'
import command from './commands/ping.mjs'
import express from 'express'
import { getImage } from './telegram.mjs'

const newMessagesMap = new Map()

/**
 * The key correspond to the telegram post id, and the message_id to the discord message id 
 * @type { Map<string, Message> } 
 */
const sentMessagesMap = new Map()

/**
 * @type { Array<string> }
 */
const toEditMessages = []

const app = express()
app.use(express.json())

// PRODUCTION ID -> 1186041173530398841
// DEV ID        -> 1186711941465505862
const chanelId = '1186041173530398841'
const interval = 1000*30

const client = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
]})

app.post('*', async function (req, res) {
  console.log('BODY: ', req.body)
  
  try {
    if (req.body.channel_post) {
      const message = req.body.channel_post
      
      if (message.photo) {
        const data = await getImage(message.photo[message.photo.length - 1].file_id)
        console.log('IMAGE DATA:', data)

        newMessagesMap.set(message.message_id, { message, img: data })
      }
    }
    else if (req.body.edited_channel_post) {
      const message = req.body.edited_channel_post

      for (const [key, sentMessage] of sentMessagesMap.entries()) {
        console.log(key)

        if (key === message.message_id) {
          toEditMessages.push(message.message_id)

          sentMessage.content = (message.caption || '') + '\n\n** **'
          console.log('edited message: ', sentMessage.content)
        }
      }
    }
  } catch(error) {
    console.error('FAILED TO RECEIVE MESSAGE:')
    console.error(error)
  }

  console.log('MAP SIZE:', newMessagesMap.size)
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

  const channel = client.channels.cache.get(chanelId)

  if (!channel) {
    console.error(`Channel with ID ${chanelId} not found.`)
    
    return
  }

  // NOTE - Cron job (task) for deleting sent messages once every week
  const clearMessagesJob = () => {
    sentMessagesMap.clear();
    setTimeout(clearMessagesJob, 7 * 24 * 60 * 60 * 1000); // Run every week (7 days)
  };
  
  // Initial call to start the job
  clearMessagesJob();

  setInterval(async () => {
    if (newMessagesMap.size <= 0) {
      return
    }

    for (const [key, message] of newMessagesMap.entries()) {
      console.log('KEY: ', key)

      try {
        const formatedMessage = (message.message.caption || '') + '\n\n** **'

        console.log('STRINGFY: ', JSON.stringify(message.message.message_id))

        await channel.send({ files: [{ attachment: message.img, name: 'attachment.jpg' }] })

        /**
         * @type {Message}
         */
        const sentMessage = await channel.send(formatedMessage)

        if (fs.existsSync(message.img)) {
          fs.unlinkSync(message.img)
    
          console.log('REMOVED IMAGE FROM MEMORY')
        }

        newMessagesMap.delete(key) 
        sentMessagesMap.set(key, sentMessage)
      } catch(error) {
        console.error('FAILED WHEN TRYING TO SEND THE MESSAGE')
        console.error(error)
      }
    }

    newMessagesMap.clear()

    console.log('MESSAGES TO DELET: ', newMessagesMap.size)
  }, interval)

  // NOTE - Message Editing
  setInterval(() => {
    if (toEditMessages.length <= 0) {
      return
    }

    for (const [index, message] of toEditMessages.entries()) {
      // TODO - Handle editing

      if (sentMessagesMap.has(message)) {
        const newMessage = sentMessagesMap.get(message)

        newMessage.edit(newMessage.content)
        toEditMessages.splice(index)
      }
    }    
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
