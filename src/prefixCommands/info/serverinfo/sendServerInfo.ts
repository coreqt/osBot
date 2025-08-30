import { Message } from "discord.js";

var {  EmbedBuilder } = require("discord.js");
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";

module.exports = {
    structure: {
        name: "serverinfo",
        description: "Get Info About Server",
        usage: `${prefix}serverinfo`
    },
    execute: async (message: Message) => {
        if(!message.channel.isSendable())return;

        if (!message?.guild) {
            return message.channel.send({ content: `This command can only be executed in a server.` });
        };
        const owner = await message.guild.fetchOwner(),
            createdTimestamp: number = Math.floor(message.guild.createdTimestamp / 1000),
            channels = message.guild.channels.cache,
            roles = message.guild.roles.cache.filter((i:any) => i.id !== message.guild?.roles.everyone.id),
            members = message.guild.members.cache;

        const ServerEmbed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle(`${message.guild.name} - Server info`)
            .setThumbnail(message.guild.iconURL({ size: 256 }))
            .setImage(message.guild.bannerURL({ size: 256 }))
            .addFields(
                { name: 'Owner', value: `${owner.user.displayName} (${owner.user.id})` },
                {
                    name: "Channels",
                    value: `Text: ${channels.filter((c: any) => c.type === 0).size.toString()}\nVoice: ${channels.filter((c: any) => c.type === 2).size.toString()}\nCategory: ${channels.filter((c: any) => c.type === 4).size.toString()}`,
                },
                { name: 'Members', value: `${members.sort((a: any, b: any) => a.joinedTimestamp! - b.joinedTimestamp!).first(10).map((i: any) => `<@${i.id}>`).join(", ")} ${members.size > 15 ? `and **${members.size - 15}** more` : ""}` },
                {
                    name: `Roles (${roles?.size ?? "0"} in total)`,
                    value: `${roles.size > 15 ? `${roles.first(15).map((i: any) => `<@&${i.id}>`).join(", ")} and **${roles?.size - 15}** more` : roles.first(15).map((i: any) => `<@&${i.id}>`).join(", ")} `,
                },
                { name: 'Created', value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)` }
            )
            .setFooter({ text: 'Requested by ' + message.author.displayName, iconURL: message.author.displayAvatarURL() });

        message.channel.send({ embeds: [ServerEmbed] });
    }
};