import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";
module.exports = {
    structure: {
        name: "happy",
        description: "Sends a Gif category: happy",
        usage: `${prefix}happy`
    },
    execute: async(message:Message)=>{
        send(message, 'happy', `${message.author.globalName}’s face lit up with a radiant smile, their eyes sparkling with the unmistakable glow of happiness`);
    },
};