// Imports
import { EmbedBuilder, User, TimestampStyles, Message, Client} from "discord.js";
import { HydratedDocument } from "mongoose";
import { errorLog } from "../../utils/sendLog";
import 'dotenv/config';
import {afkModel, PingedBy, Iafk} from "../../model/afkModel";
import unixToRelativeTime from "../../utils/unixToRelativeTime";

var getUserById = require('../../utils/getUserById');

const prefix: any = process.env.PREFIX || "o!";

module.exports = {
    execute: async (message: Message, client: Client) => {
        // checking if message object is empty of whether the msg was sent by a bot.
        if (!message) return;
        if (message.author.bot) return;

        // Fetching message author's document from the database.
        const authorId = message.author.id;
        const afkDoc = await afkModel.findOne({ userId: authorId })
        
        if (afkDoc && afkDoc.userId == authorId) { // User who sent messages was afk
            
            // Defining Embed variable
            const embedColor: any = process.env.PRIMARY_EMBED_COLOR || "#FFC5D3"
            const Embed = new EmbedBuilder();
            Embed.setColor(embedColor);
            Embed.setAuthor({ name: `Yo ${message.author.globalName}` });
            let pingedByArr: PingedBy[] = afkDoc.pingedBy;

            if (pingedByArr.length == 0) { // If afk user wasnt pinged by anyone while he/she was afk.

                Embed.addFields({
                    name: `Welcome Back!`,
                    value: `You were AFK From <t:${afkDoc.afkStartTime}:R> :3`,
                    inline: false
                })

            } else { // afk user was pinged multiple times by other user
                Embed.setDescription(`Welcome Back! You were AFK From <t:${afkDoc.afkStartTime}:${TimestampStyles.ShortTime}> & you were pinged by`);

                for (let i = 0; i < afkDoc.pingedBy.length; i++) { // Adding multiple fields for 

                    Embed.addFields({
                        name: `@${pingedByArr[i].username} - ${unixToRelativeTime(pingedByArr[i].timestamp)}`,
                        value: `[Click Here](https://discord.com/channels/@me/${pingedByArr[i].channelId}/${pingedByArr[i].messageId}) To See`,
                        inline: true
                    })
                }


            }

            setDefaultUserName(message, afkDoc, client) // Setting Deafult username
            await safeReply(message, { embeds: [Embed] }); // sending embed
            await afkDoc.deleteOne(); // Delete's the document from the database.
            return;
        }else{ // If message author was not afk

            afkCheckOnMentionMessage(message); // Checks and replies whether the message string contains
            afkCheckOnRepliedMessage(message);
            return;
        }
    }

}


async function afkCheckOnMentionMessage(message: Message): Promise<void> {
    if (!message) return;
    if (message.author.bot) return;
    const messageString = message.content;

    const regex = /<@(\d+)>/g;
    let userIds: string[] = [];
    let match;

    while ((match = regex.exec(messageString)) !== null) {
        userIds.push(match[1]);
    }

    if (userIds.length == 0) return;

    for (let userid of userIds) {
        try {
            var queryResult = await afkModel.findOne({ userId: userid });
            if (!queryResult) {
                throw new Error("There was an Error while retreving data from database")
            }
        } catch (err) {
            continue;
        }
        if (queryResult == null) return;

        // if (queryResult.length < 1) continue;
        if (!queryResult.userId) continue;


        const reason = queryResult.reason;


        if (queryResult.userId == userid) {
            const userData: User = await getUserById(userid);
            if (!userData) continue;
            let embed: EmbedBuilder = new EmbedBuilder();
            let name: string;
            if (userData.globalName) {
                name = userData.globalName;
            } else {
                name = userData.username;
            }


            const embedColor: any = process.env.PRIMARY_EMBED_COLOR || "#FFC5D3"

            const relativeTime = unixToRelativeTime(queryResult.afkStartTime);

            embed.setColor(embedColor);

            let titleStr = `${name} is AFK - ${relativeTime}`;

            if (queryResult.reason) {
                titleStr = `${name} is AFK. Reason: ${reason} - ${relativeTime}`;
            }

            embed.setAuthor({ name: titleStr, iconURL: validateIconURL(userData.avatarURL()) });
            // embed.setImage('https://c.tenor.com/w4wGt0MgpjMAAAAd/tenor.gif')
            await safeReply(message, { embeds: [embed] });

            if (queryResult?.pingedBy.length > 10) {
                continue;
            }

            const rawCurrentTimeStamp: number = message.createdTimestamp;
            const currentTimeStamp: number = (rawCurrentTimeStamp / 1000) | 0;

 
            let pingedBy: PingedBy = {
                username: message.author.username,
                channelId: message.channel.id,
                messageId: message.id,
                timestamp: currentTimeStamp,
            }

            await afkModel.findOneAndUpdate({ userId: userid }, {
                $push: {
                    pingedBy: pingedBy
                }
            })
        } else {
            continue;
        }
    }
    return;
}


async function afkCheckOnRepliedMessage(message: Message): Promise<void> {
    if (!message) return;
    if (message.author.bot) return;
    if (message?.reference?.messageId) {
        let msg;
        let queryResult;
        try {
            msg = await message.channel.messages.fetch(message.reference.messageId);
            queryResult = await afkModel.findOne({ userId: msg.author.id });
        } catch (err) {
            errorLog(err, message);
            console.log(err);
        }


        if (queryResult == null || !msg || !queryResult) return;
        if (queryResult.reason) {
            // if (queryResult.length < 1) return;

            const reason = queryResult.reason;

            if (message.author.id == queryResult.userId) return;


            if (queryResult.userId == msg.author.id) {

                const userData: User = await getUserById(queryResult.userId);

                let embed: EmbedBuilder = new EmbedBuilder();
                let name: string;
                if (userData.globalName) {
                    name = userData.globalName;
                } else {
                    name = userData.username;
                }
                const embedColor: any = process.env.PRIMARY_EMBED_COLOR || "#FFC5D3"
                embed.setColor(embedColor);
                const relativeTime = `${unixToRelativeTime(queryResult.afkStartTime)}`
                let titleStr = `${name} is AFK - ${relativeTime}`;
                // embed.setTitle(`From <t:${queryResult.afkStartTime}:${TimestampStyles.LongTime}>(<t:${queryResult.afkStartTime}:${TimestampStyles.RelativeTime}>)`);
                if (queryResult.reason != 'none') {
                    titleStr = `${name} is AFK, Reason: ${reason} - ${relativeTime}`
                }
                embed.setAuthor({ name: titleStr, iconURL: validateIconURL(userData.avatarURL()) });
                // embed.setImage('https://c.tenor.com/w4wGt0MgpjMAAAAd/tenor.gif')
                await safeReply(message, { embeds: [embed] });
            } else {
                return;
            }
        }
    }
    return;
}

async function setDefaultUserName(message: Message, queryResult: HydratedDocument<Iafk>, client: Client,): Promise<void> {
    if (!message || !message.guild || !message.channel.isSendable()) return;

    const guildMembers = message.guild.members;

    if (!guildMembers.me || !guildMembers) return;

    const clientPerms = guildMembers.me.permissions.has("ManageNicknames");
    let changeNick = queryResult.hasChangedNick;

    if (!message.member || !clientPerms || !message?.member.roles.highest || !client.user) {

        message.channel.send('I don\'t have permission to change your nickname!');
        return;

    }
    const authorHighestRolePos = message?.member?.roles.highest.position;
    const clientHighestRolePos = guildMembers.resolve(client.user)?.roles.highest.position;

    if (!clientHighestRolePos) {
        throw new Error(`Unable to fetch Client's Highest role position in afkCheck.ts`);
    }

    if (authorHighestRolePos > clientHighestRolePos) {
        changeNick = false;

        const note = await message.channel.send(`Auto AFK Nickname Feature wont work. Please Put my role Above yours to make it workable.`);
        setTimeout(() => note.delete(), 7000);

        return;
    }


    try {
        if (changeNick) {
            let guild = client.guilds.cache.get(queryResult.afkGuildId);
            if (!guild) return;

            let member = guild.members.cache.get(message.author.id);
            await member?.setNickname(queryResult.oldGuildNickname);
        }

    } catch (err) {
        const note = await message.reply(`Unable to change Nickname back to normal. Please try to put my role Above yours to make it workable.`);
        setTimeout(() => note.delete(), 7000);
    }


    return
}

function validateIconURL(url: string | null): string | undefined {
    if (!url || url === 'null') return undefined;
    try {
        new URL(url);
        return url;
    } catch (err) {
        errorLog(err);
        return undefined;
    }
}

async function safeReply(message: Message, options: any): Promise<void> {
    try {
        if (message.reference?.messageId) {

            await message.channel.messages.fetch(message.reference.messageId);
        }
        await message.reply(options);
    } catch (error: any) {
        if (!message.channel.isSendable()) return;

        await message.channel.send(options);
    }
}