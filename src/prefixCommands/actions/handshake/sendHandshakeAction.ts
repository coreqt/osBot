import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
var config = require('../../../../config.json');
var getUserById = require('../../../utils/getUserByRawMessage');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";

module.exports = {
    structure:{
        name: "handshake",
        description: "Handshake with some Someone",
        usage: `${prefix}handshake <mention>`
    },
    execute: async (message: Message) => {
        const args =  message.content.slice(prefix.length).trim().split(/ +/);
        args.shift();
        let mentionedUser = message.mentions.users.first();

        if (args.length != 1 && args.length < 1 || !mentionedUser) {
            message.reply(`INVAILD ARGS! use \`${prefix}handshake @user\``);
            return;
        }


        send(message, 'handshake', `${message.author.globalName} and ${mentionedUser.globalName} clasp hands in a firm handshake, sealing their agreement with mutual respect`);

    }
}
