import 'dotenv/config'
import Discord, { GatewayIntentBits, Events } from 'discord.js'

const client = new Discord.Client({ intents: [GatewayIntentBits.Guilds] })

client.on(Events.ClientReady, (client) => {
  console.log(`Logged as ${client.user.tag}`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return
  }

  //const command = interaction.client.comm
})

client.login(process.env.DISCORD_SECRET)