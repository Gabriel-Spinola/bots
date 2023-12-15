import 'dotenv/config'
import { GatewayIntentBits, Events, Client, REST, Routes, Interaction, IntentsBitField } from 'discord.js'
import command from './commands/ping'

const client = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
  //GatewayIntentBits.MessageContent
]})

client.on(Events.ClientReady, (client) => {
  console.log(`Logged as ${client.user.tag}`)
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

})

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
	
    console.log('\nINTERACTION\n')
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
		interaction.reply('Pong.')
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

client.on(Events.MessageCreate, async message => {
  if (message.content === `cardapio`) {
      await message.reply({
          content: "porra",
      })

      console.log('asasdsa')
    }
    console.log(message.content)
})

client.login(process.env.DISCORD_SECRET)