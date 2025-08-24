import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
var config = require('../../../../config.json');
var getUserById = require('../../../utils/getUserByRawMessage');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";
module.exports = {
    structure:{
        name: "poke",
        description: "poke Someone",
        usage: `${prefix} poke <mention>`
    },
    execute: async (message: Message) => {
        const args =  message.content.slice(prefix.length).trim().split(/ +/);
        args.shift();
        let mentionedUser = message.mentions.users.first();

        if (args.length != 1 && args.length < 1 || !mentionedUser) {
            sendInvaildMsg(message);
            return;
        }

        send(message, 'poke', `Aww... ${message.author.globalName} is Pokeing ${mentionedUser.globalName}`)

    }
}

async function sendInvaildMsg(message:  Message){
    message.reply(`INVAILD OPTIONS! use \`${prefix}poke @user\``);
}