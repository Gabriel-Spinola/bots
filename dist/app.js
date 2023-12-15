"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
require("dotenv/config");
const discord_js_1 = require("discord.js");
const ping_1 = __importDefault(require("./commands/ping"));
const client = new discord_js_1.Client({ intents: [
        discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMessageReactions, discord_js_1.GatewayIntentBits.GuildMessageTyping,
        //GatewayIntentBits.MessageContent
    ] });
client.on(discord_js_1.Events.ClientReady, (client) => {
    console.log(`Logged as ${client.user.tag}`);
    const rest = new discord_js_1.REST().setToken(process.env.DISCORD_SECRET);
    (async () => {
        try {
            console.log(`Started refreshing ${JSON.stringify(ping_1.default)} application (/) commands.`);
            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(discord_js_1.Routes.applicationCommands(process.env.CLIENT_ID), { body: [ping_1.default.data.toJSON()] });
            console.log(`Successfully reloaded ${JSON.stringify(data)} application (/) commands.`);
        }
        catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
});
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    console.log('\nINTERACTION\n');
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'ping') {
        interaction.reply('Pong.');
    }
    try {
        await ping_1.default.execute(interaction);
    }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});
client.on(discord_js_1.Events.MessageCreate, async (message) => {
    if (message.content === `cardapio`) {
        await message.reply({
            content: "porra",
        });
        console.log('asasdsa');
    }
    console.log(message.content);
});
client.login(process.env.DISCORD_SECRET);
async function GET(req) {
    return Response.json({ data: '' }, { status: 200 });
}
exports.GET = GET;
//# sourceMappingURL=app.js.map