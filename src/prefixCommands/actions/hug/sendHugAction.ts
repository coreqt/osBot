import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";

module.exports = {
    structure:{
        name: "hug",
        description: "Hug Someone 🤗",
        usage: `${prefix}hug <mention>`
    },
    execute: async (message: Message) => {
        const args =  message.content.slice(prefix.length).trim().split(/ +/);
        args.shift();
        let mentionedUser = message.mentions.users.first();

        if (args.length != 1 && args.length < 1 || !mentionedUser) {
            message.reply(`INVAILD OPTIONS! use \`${prefix}hug @user\``);
            return;
        }


        send(message, 'hug', `${message.author.globalName} envelops ${mentionedUser.globalName} in a warm embrace, their connection palpable in the tightness of the hug`);

    }
}