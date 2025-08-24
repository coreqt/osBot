import { Message } from "discord.js";
import 'dotenv/config';

var {  EmbedBuilder } = require("discord.js");

var config = require('../../../../config.json');
var PREFIX = process.env.PREFIX || "o!";
module.exports = {
    structure: {
        name: "invite",
        Description: "Send's Bot Invite Links",
        usage:`${PREFIX}invite`
    },
    execute: async(message:  Message)=>{
        if(!message.channel.isSendable())return;

        let embed = new EmbedBuilder();
        embed.setColor(config.embedColor.primary);
        embed.setDescription(`https://discord.com/oauth2/authorize?client_id=${config.clientId}`)
        message.channel.send({embeds: [embed]});
    }
} 