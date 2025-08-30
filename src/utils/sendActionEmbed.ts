import { Message } from "discord.js";
import { errorLog } from "./sendLog";
import 'dotenv/config';

var { EmbedBuilder } = require('discord.js');
var { fetchAction } = require('./fetchAction');
// var {developerId, embedColor} = {process.env}
const embedColor = process.env.PRIMARY_EMBED_COLOR || "#FFC5D3";

async function sendEmbed(message: Message, endpoint: string, title: string) {
    if(!message || !message.channel.isSendable()){
        throw new Error("message object is null or undefined in sendActionEmbed.ts")
    }
    try {
        const gifData = await fetchAction(endpoint);
        if (!gifData) {
            throw new Error('Error fetching GIF data');
        }

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setAuthor({ name: title, iconURL: message.author.displayAvatarURL(), url: gifData.url })
            .setImage(gifData.url);
        
        message.channel.send({ embeds: [Embed] });
    } catch (err: any) {
        errorLog(err, message)
        console.error(err);
        message.reply('There was an error. Please try again later.');
    }
}

module.exports = sendEmbed



