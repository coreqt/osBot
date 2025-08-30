import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";

module.exports = {
    structure:{
        name: "kiss",
        description: "Kiss your love :3",
        usage: `${prefix}kiss <mention>`
    },
    execute: async (message: Message) => {
        const args = await message.content.slice(prefix.length).trim().split(/ +/);
        args.shift();

        let mentionedUser = message.mentions.users.first();

        if (args.length != 1 && args.length < 1 || !mentionedUser) {
            message.reply(`INVAILD OPTIONS! use \`${prefix}kiss @user\``);
            return;
        }


        send(message, 'kiss', `${message.author.globalName} leans in, their lips meeting ${mentionedUser.globalName}'s in a fleeting moment of affection`);

    }
}