import { Channel } from "diagnostics_channel";
import { Message, Client, GuildChannel, TextChannelType, GuildMessageManager, Webhook, TextChannel, ChannelType, NewsChannel, ClientUser } from "discord.js";
import { evaluate } from "mathjs";
import 'dotenv/config';

var { WebhookClient } = require('discord.js');
var guildModel = require('../../model/guildModel');
var countingDoc = require('../../model/countingModel');
var prefix = process.env.PREFIX || 'o!';

module.exports = {
    execute: async (message: Message, client: Client) => {
        if (!message || message.author.bot || message.content.toLowerCase().startsWith(prefix) || !message.guild?.id) return;

        const { guild, channel, author, content } = message;
        const guildId = guild.id;
        const channelId = channel.id;

        let queryResult = await countingDoc.findOne({ guildId });

        if (!queryResult || channelId !== queryResult.channelId) return;

        message.delete();

        let number: number; // Initialize number
        try {
            number = evaluate(content); // checks for mathematical expression
        } catch {  // If it throws err which means its not a vaild expression, therefore number is Not a Number.
            number = NaN;
        }

        if (Number.isNaN(number)) { // Checks if its NaN
            warn(message, `Uh oh ${author.username}, the next number is ${queryResult.lastNumber + 1}`);
            return;
        }

        if (queryResult.lastUserId === author.id) { // Checks for the same user
            warn(message, `${author.username}, you cannot count twice!`);
            return;
        }

        if (queryResult.lastNumber + 1 !== number) { // Checks fi number is correct
            warn(message, `${author.username}, the next number is ${queryResult.lastNumber + 1}`);
            return;
        }

        await processCorrectNumber(message, client, queryResult);

        return;
    }
}



async function warn(message: Message, warningMessage: string): Promise<void> {
    if (message.channel.isDMBased()) return;
    const warning = await message.channel.send(`\`\`\`${warningMessage}\`\`\``);
    setTimeout(() => warning.delete(), 3000);
}


async function processCorrectNumber(message: Message, client: Client, doc: typeof countingDoc): Promise<void> {
    if (!client.user ||message.channel.isDMBased() || !message.channel.isSendable() || !message.channel.isTextBased() || message.channel.isVoiceBased() || message.channel.isThread()) return;
    const { author, channel, content } = message;
    const bot = client.user;


    let guild = await guildModel.findOne({ guildId: channel.guild.id });

    let webhook: Webhook;
    if (!guild || !guild.webhook || !guild.webhook.id || !guild.webhook.token) {
        webhook = await createAndStoreWebhook(channel, bot);
    } else {
        webhook = new WebhookClient({
            id: guild.webhook.id,
            token: guild.webhook.token,
        });
    }

    await webhook.send({
        content,
        username: author.globalName || author.username,
        avatarURL: author.displayAvatarURL({ forceStatic: false, extension: "png" })
    });

    doc.lastNumber += 1;
    doc.lastUserId = author.id;
    await doc.save();

    await message.channel.setTopic(`Count to your heart's content! by OS Bot! The next number is ${doc.lastNumber + 1}`);
    return;
}

async function createAndStoreWebhook(channel: TextChannel | NewsChannel, bot: ClientUser): Promise<Webhook> {
    const webhook = await channel.createWebhook({
        name: bot.username,
        avatar: bot.displayAvatarURL({ forceStatic: false, extension: "png" })
    });

    await guildModel.findOneAndUpdate(
        { guildId: channel.guild.id },
        {
            $set: {
                "webhook.id": webhook.id,
                "webhook.token": webhook.token,
            }
        },
        { new: true, upsert: true }
    );

    return webhook;
}
