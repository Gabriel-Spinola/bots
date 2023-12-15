import 'dotenv/config'
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import command from './commands/ping.mjs'

const rest = new REST().setToken(process.env.DISCORD_SECRET);

(async() => {
  try {
		console.log(`Started refreshing ${JSON.stringify(command)} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: [command.data.toJSON()] },
		);

		console.log(`PONG`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})()
