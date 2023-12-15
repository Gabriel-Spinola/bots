"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandData = new discord_js_1.SlashCommandBuilder()
    .setName("ping")
    .setDescription("pong");
async function execute(interaction) {
    await interaction.reply(`This command was run by ${interaction.user.username}.`);
}
const command = {
    data: commandData,
    execute,
};
exports.default = command;
//# sourceMappingURL=ping.js.map