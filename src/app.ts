import 'dotenv/config'
import { GatewayIntentBits, Events, Collection, Client} from 'discord.js'
import command from './ping'

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.on(Events.ClientReady, (client) => {
  console.log(`Logged as ${client.user.tag}`)
})

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName !== command.data.name) {
    return 
  }

  try {
    await command.execute(interaction)
  } catch (error: unknown) {
    console.error(error);
    
    if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
  }
})

client.login(process.env.DISCORD_SECRET)