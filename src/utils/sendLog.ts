import { Client, EmbedBuilder, Message } from "discord.js";
import 'dotenv/config';

const client: Client = require('../index').client;

async function errorLog(err: any, message?: Message) {

    const errChannelId= process.env.ERROR_LOG_CHANNEL_ID;

    if(!errChannelId){
        console.warn("Error Log Channel Id is not provided!, please check your .env files and make sure its same as example.env")
        return;
    }

    const errChannel = await client.channels.cache.get(errChannelId);
    if (!errChannel?.isSendable()) {
        throw new Error("Error Channel is Not Sendalbe Channel");
    };

    const embed = new EmbedBuilder()
    .setColor("Red")
    .setDescription(`${err.toString()}`)
    if(message && message.guild){

        embed.addFields([
            {name: "message text:", value: `${message.content}` },
            {name: "message author:", value: `${message.author.username}`},
            {name: "message id", value: `${message.id}`},
            {name: "server name:", value: `${message.guild.name}`},
            {name: "server owner id:", value: `${message.guild.ownerId}`},
        ])
        
    }

    errChannel.send({embeds: [embed]});
}

export { errorLog };