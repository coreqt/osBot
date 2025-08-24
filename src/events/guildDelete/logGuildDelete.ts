import {Guild, Client, Channel} from 'discord.js';
import 'dotenv/config'

module.exports = {
    execute: async (guild: Guild, client: Client) => {
        let logChannelId = process.env.LEAVE_LOG_CHANNEL_ID;
        if(!logChannelId){
            console.warn("LEAVE_LOG_CHANNEL_ID does not exist in .env");
            return;
        }

        const channel: Channel | null = await client.channels.fetch(logChannelId);
        if(!channel || !channel.isSendable()) return;
        const serverCount = client.guilds.cache.size;

        if(!channel.isTextBased()) return;
        channel.send(`Kicked Out of ${guild.name} Server, Server Count: ${serverCount}`);

    }
}