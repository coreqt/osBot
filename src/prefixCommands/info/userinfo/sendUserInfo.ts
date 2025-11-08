import { GuildMember, Message, User } from "discord.js";
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";

var { EmbedBuilder } = require('discord.js')
module.exports = {
    structure: {
        name: "userinfo",
        description: "Get Info About Yourself Or Somebody Else",
        usage: `${prefix}userinfo <mention>`
    },
    execute: async (message: Message) => {
        if(!message.channel.isSendable())return;
        if (!message?.guild) {
            return message.channel.send('This command can only be executed in a server.');
        }
        
        const messageArray = message.content.slice(2).trim().split(/ +/);
        messageArray.shift();
        
        let user: User | GuildMember | undefined;
        if (!messageArray[0]) {
            user = message.author;
        } else {
            user = message.mentions.users.first() || message.guild.members.cache.get(messageArray[0])?.user;
        }
        
        if (!user) {
            return message.channel.send('User not found.');
        }
        
        const createdTimestamp: number = Math.floor(user.createdAt.getTime() / 1000);
        
        const member = message.guild.members.cache.get(user.id);
        const rolesCount = member ? member.roles.cache.size : 0;
        
        const ServerEmbed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle(`${user.globalName ?? 'Unknown'} - User info`)
            .setThumbnail(user.displayAvatarURL({ size: 4096, extension: 'png', forceStatic: false }))
            .addFields(
                { name: 'User Name', value: user.username, inline: true },
                { name: 'Global Name', value: user.globalName ?? 'Unknown', inline: true },
                { name: 'Id', value: user.id.toString(), inline: true },
                { name: 'Roles Count', value: rolesCount.toString() || "No Roles!", inline: true },
                { name: 'Created At', value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)` },
            )
            .setFooter({ text: 'requested by ' + message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        
        message.channel.send({ embeds: [ServerEmbed] });
        
    }
}