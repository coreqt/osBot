import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";
module.exports = {
    structure: {
        name: "yawn",
        description: "Sends a Gif category: yawn",
        usage: `${prefix}yawn`
    },
    execute: async(message:Message)=>{
        send(message, 'yawn', `${message.author.globalName} is caught in a yawn`);
    },
};