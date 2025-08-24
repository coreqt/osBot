import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";
module.exports = {
    structure: {
        name: "smile",
        description: "Sends a Gif category: smile",
        usage: `${prefix}smile`
    },
    execute: async(message:Message)=>{
        send(message, 'smile', `${message.author.globalName}'s smile Lights up the room`);
    },

};