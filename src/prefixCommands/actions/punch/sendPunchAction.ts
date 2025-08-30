import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";

module.exports = {
    structure:{
        name: "punch",
        description: "Punch Someone 🤛🏻",
        usage: `${prefix}punch <mention>`
    },
    execute: async (message: Message) => {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        args.shift();
        let mentionedUser = message.mentions.users.first();

        if (args.length != 1 && args.length < 1 || !mentionedUser) {
            message.reply(`INVAILD OPTIONS! use \`${prefix}punch @user\``);
            return;
        }


        send(message, 'punch', `${message.author.globalName}'s fist meets ${mentionedUser.globalName}'s with a solid thump, a burst of tension in the air`)

    }
}
