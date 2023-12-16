import { SlashCommandBuilder } from "discord.js";
import { messagesMap } from "../app.mjs";

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		
		messagesMap.forEach(async message => {
			await interaction.reply(message.text);
		});
	},
};