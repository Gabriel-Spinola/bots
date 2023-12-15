import { DISCORD_SECRET } from './config.json'
import Discord, { GatewayIntentBits, Events } from 'discord.js'

const client = new Discord.Client({ intents: [GatewayIntentBits.Guilds] })

client.on(Events.ClientReady, (client) => {
  console.log(`Logged as ${client.user.tag}`)
})

client.login(DISCORD_SECRET)