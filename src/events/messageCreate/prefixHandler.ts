import {
    Message,
    EmbedBuilder,
    Client,
    Channel,
    PermissionResolvable,
    User,
    PermissionsBitField,
} from "discord.js";
import "dotenv/config";

var guildDoc = require("../../model/guildModel");
var userDoc = require("../../model/userModel");

const cooldowns = new Map();
module.exports = {
    execute: async (message: Message, client: _Client) => {
        var prefix = null;
        if (
            !message ||
            message.author.bot ||
            !message.channel.isSendable() ||
            message.channel.isDMBased() ||
            !message.guild ||
            !client.user?.id
        )
            return;
        const guildId = message.guild.id;
        const guildName = message.guild.name;
        const authorId = message.author.id;
        const authorUsername = message.author.username;
        const msgContent = message.content;
        const channel: Channel = message.channel;
        const clientPerms = channel.permissionsFor(client.user.id);
        if (!clientPerms) {
            throw new Error("Client Permissions are Null");
        }

        if (msgContent == `<@${process.env.CLIENT_ID}>`) {
            let missingPerms = checkMissingPerms(clientPerms, [
                "SendMessages",
                "EmbedLinks",
            ]);

            if (missingPerms.length > 0) {
                try {
                    let user = await client.users.fetch(authorId, { cache: false });
                    await user.send(
                        `# I don't have following permissoins in \`${guildName}\` Server\n\`\`\`${missingPerms}\`\`\`\n-# IF YOU THINK THIS IS A BUG PLEASE OPEN AN ISSUE ON OUR [GITHUB](https://github.com/notcorefr/osBot) PAGE`
                    );
                } catch (error) {
                    message.channel.send(
                        `# I don't have following permissoins in \`${guildName}\` Server\n\`\`\`${missingPerms}\`\`\`\n-# IF YOU THINK THIS IS A BUG PLEASE OPEN AN ISSUE ON OUR [GITHUB](https://github.com/notcorefr/osBot) PAGE`
                    );
                }
                return;
            }

            let embed = new EmbedBuilder();
            embed.setDescription(
                `My default Prefix is \`${process.env.PREFIX}\`\nUse \`${process.env.PREFIX}help\`for help`
            );
            message.channel.send({ embeds: [embed] });
            return;
        }

        var messageUserId = authorId;
        var userData = await userDoc.findOne({ userId: messageUserId });

        if (!userData) {
            const _userData = new userDoc({
                userId: authorId,
                joinedAt: new Date(),
                customPrefixes: [],
            });
            await _userData.save();
            userData = await userDoc.findOne({ userId: messageUserId });
        }

        var guildData: any = await guildDoc.findOne({ guildId: guildId });
        if (!guildData) {
            const _guildData = new guildDoc({
                guildId: guildId,
                customPrefixes: [],
            });
            await _guildData.save();
            guildData = await guildDoc.findOne({ guildId: guildId });
        }
        if (!Array.isArray(userData?.customPrefixes)) {
            userData.customPrefixes = [];
        }

        if (!Array.isArray(guildData?.customPrefixes)) {
            if (guildData) {
                guildData.customPrefixes = [];
            }
        }

        // let prefixes = userData.customPrefixes.concat(guildData.customPrefixes, {prefix: `<@${config.clientId}>`});
        var prefixes = [];
        prefixes.push(`<@${process.env.CLIENT_ID}>`, process.env.PREFIX, "os");
        for (let i = 0; i < userData.customPrefixes.length; i++) {
            prefixes.push(userData.customPrefixes[i].prefix);
        }

        if (guildData) {
            for (let i = 0; i < guildData.customPrefixes.length; i++) {
                prefixes.push(guildData.customPrefixes[i].prefix);
            }
        }

        for (let i = 0; i < prefixes.length; i++) {
            if (msgContent.toLowerCase().startsWith(prefixes[i].toLowerCase())) {
                prefix = prefixes[i].toLowerCase();
            }
        }
        if (!prefix) {
            return;
        }

        if (!msgContent.toLowerCase().startsWith(prefix)) return;

        var args: any;
        args = msgContent.slice(prefix.length).trim().split(/ +/);
        const msgCommand = args.shift().toLowerCase();

        const now = Date.now();
        const cooldownAmount = 3 * 1000; // 3 seconds cooldown

        if (!cooldowns.has(authorId)) {
            cooldowns.set(authorId, now);
        } else {
            const expirationTime = cooldowns.get(authorId) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(
                    `please wait ${timeLeft.toFixed(
                        1
                    )} more second(s) before reusing the \`${msgCommand}\` command.`
                );
            }

            cooldowns.set(authorId, now);
        }

        const { prefixCommands } = client;
        const command = prefixCommands.get(msgCommand);
        if (!command) return;
        try {
            let missingPerms = checkMissingPerms(clientPerms, [
                "EmbedLinks",
                "ManageMessages",
                "ManageNicknames",
                "ManageWebhooks",
                "ReadMessageHistory",
                "SendMessages",
                "ViewChannel",
            ]);

            if (missingPerms.length > 0) {
                try {
                    let user = await client.users.fetch(authorId, { cache: false });
                    await user.send(
                        `# I don't have following permissoins in \`${guildName}\` Server\n\`\`\`${missingPerms}\`\`\`\n-# IF YOU THINK THIS IS A BUG PLEASE OPEN AN ISSUE ON OUR [GITHUB](https://github.com/notcorefr/osBot) PAGE`
                    );
                } catch (error) {
                    message.channel.send(
                        `# I don't have following permissoins in \`${guildName}\` Server\n\`\`\`${missingPerms}\`\`\`\n-# IF YOU THINK THIS IS A BUG PLEASE OPEN AN ISSUE ON OUR [GITHUB](https://github.com/notcorefr/osBot) PAGE`
                    );
                }
                return;
            }
            await command.execute(message, client, args);
        } catch (err: any) {
            const errChannelId = process.env.ERROR_LOG_CHANNEL_ID;

            if (!errChannelId) {
                throw new Error("ERROR_LOG_CHANNEL_ID is not provided in .env file!");
            }

            const channel = client.channels.cache.get(errChannelId);
            // const channel = client.channels.fetch(config.log.errorChannelId);
            if (!channel || !channel.isSendable()) return;
            channel.send(`
                Error: ${err.toString()}
                Stack: ${err.stack}
                Raw Message: ${msgContent}
                Command: ${msgCommand}
                Args: ${args.join(" ")}
                Guild: ${guildName} | ${guildId}
            User: ${authorUsername} | ${authorId}
            `);
            console.log(err);

            message.channel.send(
                `There was an error while executing \`${msgCommand}\` command. Data has Been Sent to Devlopers! The issue will be fixed soon`
            );
        } finally {
            const logChannelId = process.env.COMMAND_EXECUTION_LOG_CHANNEL_ID;

            if (!logChannelId) {
                throw new Error(
                    "COMMAND_EXECUTION_LOG_CHANNEL_ID is not provided in .env file"
                );
            }

            const channel = client.channels.cache.get(logChannelId);
            if (!channel || !channel.isSendable())
                throw new Error("Unable to Fetch executeChannel in prefixHandler.ts");
            const logEmbed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({
                    name: `${authorUsername}`,
                    iconURL: validateIconURL(message.author.avatarURL()),
                })
                .setTitle(message.guild.name)
                .setThumbnail(message.guild.iconURL())
                .setDescription(msgContent)
                .addFields(
                    {
                        name: "Global Name",
                        value: `${message.author.globalName}`,
                        inline: true,
                    },
                    { name: "Username", value: authorUsername, inline: true },
                    { name: "User Id", value: authorId, inline: true },
                    // { name: '\u200B', value: '\u200B' },
                    { name: "Gulid Name", value: guildName, inline: true },
                    { name: "Gulid Id", value: guildId, inline: true }
                )
                .setTimestamp();
            channel.send({ embeds: [logEmbed] });
            userData.lastUsedPrefix = prefix;
            await userData.save();
        }

        return;
    },
};

function validateIconURL(url: string | null): string | undefined {
    if (!url || url === "null") return undefined;
    try {
        new URL(url);
        return url;
    } catch {
        return undefined;
    }
}

function checkMissingPerms(
    clientPerms: Readonly<PermissionsBitField>,
    requiredPerms: Array<PermissionResolvable>
): Array<PermissionResolvable> {
    let missingPerms: Array<PermissionResolvable> = [];

    requiredPerms.forEach((perm) => {
        if (!clientPerms.has(perm)) {
            missingPerms.push(perm);
        }
    });

    return missingPerms;
}
