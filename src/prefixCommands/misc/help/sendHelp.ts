import { ColorResolvable, EmbedBuilder, Message } from "discord.js";
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const prefix = process.env.PREFIX || "o!";
const actionsDir = path.join(__dirname, '..', '..', 'actions');
const countingDir = path.join(__dirname, '..', '..', 'counting');
const emotionsDir = path.join(__dirname, '..', '..', 'emotes');
const infoDir = path.join(__dirname, '..', '..', 'info');
const coolCommandsDir = path.join(__dirname, '..', '..', 'useful');
const miscDir = path.join(__dirname, '..', '..', 'misc');

function getFileNames(dir: string): string[] {
    try {
        return fs.readdirSync(dir).map((element: string) => `\`${element}\``);
    } catch {
        return ['(none)'];
    }
}

module.exports = {
    structure: {
        name: "help",
        description: "Get Help",
        usage: `${prefix}help`
    },
    execute: async (message: Message, client: _Client, args: string[]) => {
        if (!message.channel.isSendable()) return;

        const primaryEmbedColor = process.env.PRIMARY_EMBED_COLOR as ColorResolvable || "#FFC5D3" as ColorResolvable;
        const alertEmbedColor = process.env.ALERT_EMBED_COLOR as ColorResolvable || "#ff6347" as ColorResolvable;
        const embed = new EmbedBuilder().setColor(primaryEmbedColor);

        if (args.length < 1) {
            embed.setTitle(`Here's the list of commands and categories :3`);
            const fields = [
                { name: 'Frequently Used', value: getFileNames(coolCommandsDir).join(", "), inline: false },
                { name: 'Counting Activity', value: getFileNames(countingDir).join(", "), inline: false },
                { name: 'Misc', value: getFileNames(miscDir).join(", "), inline: false },
                { name: 'Emotes', value: getFileNames(emotionsDir).join(", "), inline: false },
                { name: 'Actions', value: getFileNames(actionsDir).join(", "), inline: false },
                { name: 'Info', value: getFileNames(infoDir).join(", "), inline: false },
                { name: '\u200B', value: '\u200B' },
                {
                    name: `Written in TypeScript`,
                    value: `Help us by contributing to the project on [GitHub](https://github.com/cores-basement/osBot) *pwease~*`
                }
            ];
            embed.addFields(fields);
            embed.setFooter({ text: `Type "${prefix}help <command>" to get info about that command` });
            embed.setThumbnail(process.env.HELP_THUMBNAIL || "https://c.tenor.com/IaHOpRGFFNwAAAAC/tenor.gif");
        } else {
            const command = client.prefixCommands.get(args.shift()?.toLowerCase());
            if (!command) {
                embed.setColor(alertEmbedColor)
                    .setTitle(`Command Not Found`)
                    .setDescription(`Type ${prefix}help for a list of available commands`);
            } else {
                embed.setTitle(`**${command.structure.name}**`)
                    .addFields(
                        { name: 'Description:', value: `\`\`\`${command.structure.description}\`\`\`` },
                        { name: 'Usage:', value: `\`\`\`${command.structure.usage}\`\`\`` }
                    );
            }
        }
        message.channel.send({ embeds: [embed] });
    }
}
