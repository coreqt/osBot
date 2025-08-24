import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";
module.exports = {
    structure: {
        name: "think",
        description: "Sends a Gif category: think",
        usage: `${prefix}think`
    },
    execute: async(message:Message)=>{
        send(message, 'think', `${message.author.globalName} is lost in thought`);
    },

};