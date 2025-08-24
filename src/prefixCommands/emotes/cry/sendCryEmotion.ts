import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";
module.exports = {
    structure:{
        name: "cry",
        description: "Sends a Gif category: cry",
        usage: `${prefix}cry`
    },
    execute: async(message: Message)=>{
        send(message, 'cry', `Tears streamed down ${message.author.globalName} face as they sobbed, their heartache evident in the quivering of their lips`);
    },
};