import { Client, Message } from "discord.js";
import 'dotenv/config';
let primaryClr: any = process.env.PRIMARY_EMBED_COLOR;
var {  EmbedBuilder } = require("discord.js");

var PREFIX = process.env.PREFIX || "o!";
module.exports = {
    structure: {
        name: "invite",
        Description: "Send's Bot Invite Links",
        usage:`${PREFIX}invite`
    },
    execute: async(message:  Message, client: Client)=>{
        if(!message.channel.isSendable())return;

        let embed = new EmbedBuilder();
        embed.setColor(primaryClr);
        embed.setDescription(`https://discord.com/oauth2/authorize?client_id=${client.user?.id}`)
        message.channel.send({embeds: [embed]});
    }
} 