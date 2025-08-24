import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";
module.exports = {
    structure:{
        name: "blush",
        description: "Sends a Gif category: bored",
        usage: `${prefix}blush`
    },
    execute: async(message: Message)=>{
        send(message, 'blush', `${message.author.globalName}'s cheeks turned a rosy hue, a clear sign of the blush that spread across their face`);
    },

};