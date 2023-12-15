import { CommandInteraction, Interaction, InteractionType, SlashCommandBuilder } from "discord.js";

const commandData = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("pong")

async function execute(interaction: CommandInteraction) {
  await interaction.reply(`This command was run by ${interaction.user.username}.`)
}

const command = {
  data: commandData,
  execute,
}

export default command