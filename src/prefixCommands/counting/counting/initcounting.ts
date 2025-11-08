import { ChannelType, Client, Message } from "discord.js";
import 'dotenv/config'
import {countingModel} from "../../../model/countingModel";
let prefix = process.env.PREFIX || "o!";


var guildModel = require('../../../model/guildModel');

enum Option {
    null = -1,
    on,
    off,
}


module.exports = {
    structure: {
        name: "counting",
        description: "Start Counting In Current Channel!",
        usage: `${prefix}counting enable`
    },
    execute: async (message: Message, client: Client, args: string[]) => {
        if (!message || !message.channel.isSendable()) return;
        if (!message.member) {
            throw new Error("message.member is null in initcounting.ts:15");
        }
        if (message.channel.type !== ChannelType.GuildText) {
            message.channel.send("This command Can Only be used in Server.")
            return;
        };
        if (!message.member.permissions.has("Administrator")) {
            message.reply(`Only Admins can run this command!`);
            return;
        }
        if (!client.user) return;

        const permissions = message.channel.permissionsFor(client.user.id);
        if (!permissions || !permissions.has("ManageWebhooks")) {
            message.channel.send(`❌ I don't have permissions to manage webhooks!`);
            return;
        }


        if (args.length < 1) {
            message.channel.send(`Invalid option. Use \`${prefix}counting enable\` to enable counting activity in this channel.`);
            return
        }

        // let option = args[0].toLowerCase();
        var option = checkOption(args);

        if (!message.guild) {
            message.channel.send(`❌ This command can only be used in a server.`);
            return;
        }
        let guildId = message.guild.id;
        let channelId = message.channel.id;

        if (option === 0) {
            let oldDoc = await countingModel.findOne({ guildId });
            if (oldDoc) {
                message.reply(`Counting is already enabled in this channel.`);
                return;
            }

            let newDoc = new countingModel({
                guildId,
                channelId,
            });

            await message.channel.setTopic(`Count to your heart's content! by OS Bot! [Admins] To disable it type "${prefix}counting disable", next number is 1`);
            message.channel.send(`Enabled counting activity in this server. Enjoy!`);
            await newDoc.save();

            const bot = client.user;
            await createAndStoreWebhook(message.channel, bot);

        } else if (option === 1) {
            let oldDoc = await countingModel.findOne({ guildId });
            if (!oldDoc) {
                message.reply(`Counting is already disabled in this channel.`);
                return;
            }

            await message.channel.setTopic("");
            message.channel.send('Disabled counting activity in this server!');
            await countingModel.deleteMany({ guildId });

            await guildModel.findOneAndUpdate(
                { guildId },
                { $unset: { webhook: 1 } },
                { new: true }
            );

        } else if(option === -1) {
            message.channel.send(`Invalid option. Use \`${prefix}counting [on|enable|start]\` to enable counting activity in this channel.`);
        }
    }
};

async function createAndStoreWebhook(channel: any, bot: any) {
    const webhook = await channel.createWebhook({
        name: bot.username,
        avatar: bot.displayAvatarURL({ format: 'png', dynamic: true }),
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


function checkOption(args: string[]): Option {
    let _option = args[0].toLowerCase();
    if (_option == 'on' || _option == 'enable' || _option == 'start') {
        return Option.on;
    } else if (_option == 'off' || _option == 'disable' || _option == 'stop') {
        return Option.off;
    }else{
        return Option.null;
    }
}