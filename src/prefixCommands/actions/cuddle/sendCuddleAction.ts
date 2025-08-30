import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";

module.exports = {
    structure: {
        name: "cuddle",
        description: "Cuddle Someone",
        usage: `${prefix}cuddle <mention>`
    },
    execute: async (message: Message) => {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        args.shift();
        let mentionedUser = message.mentions.users.first();

        if (args.length != 1 && args.length < 1 || !mentionedUser) {
            message.reply(`INVAILD OPTIONS! use \`${prefix}cuddle @user\``);
            return;
        }

        send(message, 'cuddle', `${message.author.displayName} nestles into ${mentionedUser.displayName} with a cozy cuddle`);

    }
}