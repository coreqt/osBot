import { Message } from "discord.js";

var send = require('../../../utils/sendActionEmbed');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";
module.exports = {
    structure:{
        name: "bored",
        description: "Sends a Gif category: bored",
        usage: `${prefix}bored`
    },
    execute: async(message:Message)=>{
        send(message, 'bored', `${message.author.globalName} yawned and stared blankly, their eyes glazing over from the sheer monotony of the moment`);
    },
};