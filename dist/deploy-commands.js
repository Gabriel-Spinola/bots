"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const rest_1 = require("@discordjs/rest");
const discord_js_1 = require("discord.js");
const ping_1 = __importDefault(require("./commands/ping"));
const rest = new rest_1.REST().setToken(process.env.DISCORD_SECRET);
(async () => {
    try {
        console.log(`Started refreshing ${JSON.stringify(ping_1.default)} application (/) commands.`);
        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(discord_js_1.Routes.applicationCommands(process.env.CLIENT_ID), { body: [ping_1.default.data.toJSON()] });
        console.log(`Successfully reloaded ${data} application (/) commands.`);
    }
    catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
//# sourceMappingURL=deploy-commands.js.map