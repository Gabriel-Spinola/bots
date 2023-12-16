import 'dotenv/config'
import { GatewayIntentBits, Events, Client, REST, Routes } from 'discord.js'
import command from './commands/ping.mjs'

import express from 'express'

const app = express()
app.use(express.json())

app.post('*', async function (req, res) {
  console.log(req.body)

  res.send("Hello, Post")
})

app.get('*', async function (req, res) {
  res.send("Hello, GET")
})

app.listen(process.env.PORT || 4040, function (err) {
  if (err) {
    console.log(err)
  }

  console.log('Sever listening to port ' + 4040)
})


const client = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
  //GatewayIntentBits.MessageContent
]})

function updateCommands() {
  const rest = new REST().setToken(process.env.DISCORD_SECRET);

  (async() => {
    try {
      console.log(`Started refreshing ${JSON.stringify(command)} application (/) commands.`);

      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: [command.data.toJSON()] },
      );

      console.log(`Successfully reloaded ${JSON.stringify(data)} application (/) commands.`);
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  })()
}

client.on(Events.ClientReady, (client) => {
  console.log(`Logged as ${client.user.tag}`)
  
  updateCommands()
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
})

client.login(process.env.DISCORD_SECRET)

// TELEGRAM
// LINK `https://api.telegram.org/bot${process.env.TELEGRAM_SECRET}/setWebhook?url=${process.env.NGROK_URL}`