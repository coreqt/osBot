import {  Message, Client } from "discord.js";
import 'dotenv';

var { EmbedBuilder } = require('discord.js');
var guildDoc = require('../../../model/guildModel');
var userDoc = require('../../../model/userModel');
var prefix = process.env.PREFIX || "o!";

enum _prefixScope {
    self,
    server
}
enum _option {
    add,
    remove
}

let alertEmbedColor = process.env.ALERT_EMBED_COLOR || "#ff6347";


module.exports = {
    structure: {
        name: "prefix",
        description: "Set Custom Prefix For your self or server!",
        usage: `${prefix}prefix [self|server] [add|remove] <prefix>\n${prefix}prefix list`
    },
    execute: async (message: Message, client: Client, args: any) => {

        if(!message || !message.channel.isSendable())return;


        const userId = message.author.id;
        let metaData: any = {
            prefixScope: null,
            option: null,
            customPrefix: null,
        }



        // TODO

        if(args[0] == 'list'){
            let embed = new EmbedBuilder();
            embed.setColor('00FF00');
            embed.setTitle("Current Prefixes");

            let user = await userDoc.findOne({userId: userId})
            let guild = await guildDoc.findOne({guildId: message.guild?.id});
            
            let userPrefixes = user.customPrefixes;
            let serverPrefixes = guild.customPrefixes;
            embed.addFields({name: `Default Prefix`, value: `\`${prefix}\``})
            if(userPrefixes.length > 0){
                embed.addFields({name: `Self Prefixes`, value: `${userPrefixes.map((a: any) => {let b = a.prefix; return`\`${b}\``;})}`})
            } else{
                embed.addFields({name: `Self Prefixes`, value: 'NONE'});
            }

            if(serverPrefixes.length > 0){
                embed.addFields({name: `Server Prefixes`, value: `${serverPrefixes.map((a: any) => {let b = a.prefix; return`\`${b}\``;})}`})
            }else{
                embed.addFields({name: `Server Prefixes`, value: 'NONE'});
            }

            message.channel.send({embeds: [embed]});
            return;
        }


        if (args.length < 3) {
            let embed = new EmbedBuilder();
            embed.setColor(alertEmbedColor);
            embed.setTitle(`Invalid Arguments!`);
            embed.setDescription(`Usage: ${prefix}prefix [self|server] [add|remove] <prefix>\n${prefix}prefix list`)
            message.channel.send({ embeds: [embed] });
            return;
        }



        try {
            metaData.prefixScope = checkScope(message, args);
        } catch (err) {
            console.log(err)
            let embed = new EmbedBuilder();
            embed.setColor(alertEmbedColor);
            embed.setDescription(`Invalid Arguments!\nUsage: ${prefix}prefix [self|server] [add|remove] <prefix>\n${prefix}prefix list`)
            message.channel.send({ embeds: [embed] });
            return;
        }

        try {
            metaData.option = checkOption(message, args);
        } catch (err) {
            console.log(err)
            let embed = new EmbedBuilder();
            embed.setColor(alertEmbedColor);
            embed.setDescription(`Invalid Arguments!\nUsage: ${prefix}prefix [self|server] [add|remove] <prefix>\n${prefix}prefix list`)
            message.channel.send({ embeds: [embed] });
            return;
        }

        const customPrefix = args[2];
        if (customPrefix.length > 3) {
            let embed = new EmbedBuilder();
            embed.setColor(alertEmbedColor);
            embed.setDescription('You cannot add a prefix of more than three letters.')
            message.channel.send({ embeds: [embed] });
            return;
        }

        metaData.customPrefix = customPrefix;



        switch (metaData.prefixScope) {
            case 0: // Self
                let doc = await userDoc.findOne({ userId: userId });
                switch (metaData.option) {
                    case 0: // Add
                        if (doc.customPrefixes.length >= 3) {
                            let embed = new EmbedBuilder();
                            embed.setColor(alertEmbedColor);
                            embed.setDescription(`You can't add more than three prefixes at once. Consider making a donation if you want more! Contact @weeb.js if you are interested.`)
                            message.channel.send({ embeds: [embed] });
                            return;
                        }
                        if (!Array.isArray(doc.customPrefixes)) {
                            doc.customPrefixes = [];
                        }

                        for (let i = 0; i < doc.customPrefixes.length; i++) {
                            if (doc.customPrefixes[i].prefix == metaData.customPrefix) {
                                let embed = new EmbedBuilder();
                                embed.setColor('00FF00');
                                embed.setDescription(`Added \`${metaData.customPrefix}\` as a custom prefix.`);
                                message.channel.send({ embeds: [embed] });
                                return
                            }
                        }

                        await userDoc.findOneAndUpdate(
                            { userId: userId }, // Filter
                            { $push: { customPrefixes: { prefix: metaData.customPrefix, addedOn: new Date() } } }, // Update
                        );

                        let embed = new EmbedBuilder();
                        embed.setColor('00FF00');
                        embed.setDescription(`Added \`${metaData.customPrefix}\` as a custom prefix.`);
                        message.channel.send({ embeds: [embed] });

                        break;
                    case 1: // Remove
                        if (doc.customPrefixes.length < 1) {
                            let embed = new EmbedBuilder();
                            embed.setColor(alertEmbedColor);
                            embed.setDescription(`There is no custom prefix yet. Add one using ${prefix}prefix self add <prefix>.`)
                            message.channel.send({ embeds: [embed] });
                            return;
                        }
                        let isDeleted: Boolean | undefined;
                        for (let i = 0; i < doc.customPrefixes.length; i++) {
                            if (doc.customPrefixes[i].prefix == metaData.customPrefix) {
                                try {
                                    await userDoc.findOneAndUpdate(
                                        { userId: userId }, // Filter: Find user by userId
                                        { $pull: { customPrefixes: { prefix: metaData.customPrefix } } }, // Update: Remove matching prefix
                                    );
                                } catch (err) {
                                    console.log(err);
                                } finally {
                                    let embed = new EmbedBuilder();
                                    embed.setColor('00FF00');
                                    embed.setDescription(`successfully Removed self prefix: \`${metaData.customPrefix}\``);
                                    message.channel.send({ embeds: [embed] });
                                    isDeleted = true;
                                }
                            }
                        }
                        if (!isDeleted) {
                            let embed = new EmbedBuilder();
                            embed.setColor(alertEmbedColor);
                            embed.setDescription(`There is no such prefix.`);
                            message.channel.send({ embeds: [embed] });
                        }

                        break;
                }

                break;
            case 1: // guild
                let guild = await guildDoc.findOne({ guildId: message.guild?.id });
                switch (metaData.option) {
                    case 0: // Add
                        if (!message?.member?.permissions.has("Administrator")) {
                            message.reply(`Only Admins can run this command!`);
                            return;
                        }

                        if (guild.customPrefixes.length >= 3) {
                            let embed = new EmbedBuilder();
                            embed.setColor(alertEmbedColor);
                            embed.setDescription(`You can't add more than three prefixes at once. Consider making a donation if you want more! Contact @weeb.js if you are interested.`)
                            message.channel.send({ embeds: [embed] });
                            return;
                        }
                        if (!Array.isArray(guild.customPrefixes)) {
                            guild.customPrefixes = [];
                        }

                        for (let i = 0; i < guild.customPrefixes.length; i++) {
                            if (guild.customPrefixes[i].prefix == metaData.customPrefix) {
                                let embed = new EmbedBuilder();
                                embed.setColor('00FF00');
                                embed.setDescription(`Added \`${metaData.customPrefix}\` as a custom prefix.`);
                                message.channel.send({ embeds: [embed] });
                                return
                            }
                        }

                        await guildDoc.findOneAndUpdate(
                            { guildId: message.guild?.id }, // Filter
                            { $push: { customPrefixes: { prefix: metaData.customPrefix, addedOn: new Date() } } }, // Update
                        );

                        let embed = new EmbedBuilder();
                        embed.setColor('00FF00');
                        embed.setDescription(`Added \`${metaData.customPrefix}\` as a custom prefix For This Server.`);
                        message.channel.send({ embeds: [embed] });

                        break;
                    case 1: // Remove


                        if (guild.customPrefixes.length < 1) {
                            let embed = new EmbedBuilder();
                            embed.setColor(alertEmbedColor);
                            embed.setDescription(`There is no custom prefix yet. Add one using ${prefix}prefix server add <prefix>.`)
                            message.channel.send({ embeds: [embed] });
                            return;
                        }

                        let isDeleted: Boolean | undefined;
                        for (let i = 0; i < guild.customPrefixes.length; i++) {
                            if (guild.customPrefixes[i].prefix == metaData.customPrefix) {
                                try {
                                    await guildDoc.findOneAndUpdate(
                                        { guildId: message.guild?.id }, // Filter: Find user by userId
                                        { $pull: { customPrefixes: { prefix: metaData.customPrefix } } }, // Update: Remove matching prefix
                                    );
                                } catch (err) {
                                    console.log(err);
                                } finally {
                                    let embed = new EmbedBuilder();
                                    embed.setColor('00FF00');
                                    embed.setDescription(`successfully Removed Server prefix: \`${metaData.customPrefix}\``);
                                    message.channel.send({ embeds: [embed] });
                                    isDeleted = true;
                                }
                            }
                        }
                        if (!isDeleted) {
                            let embed = new EmbedBuilder();
                            embed.setColor(alertEmbedColor);
                            embed.setDescription(`There is no such Server prefix.`);
                            message.channel.send({ embeds: [embed] });
                        }
                        break;
                }
                break;
        }

    }
}



function checkScope(message: Message, args: any): Number {
    if (!message?.guild) {
        return _prefixScope.self;
    }
    if (args[0] === 'self') {
        return _prefixScope.self;
    } else if (args[0] === 'server') {
        return _prefixScope.server;
    } else {
        throw new Error("Invalid Arguments!");
    }
}

function checkOption(message: Message, args: any): Number {
    if (args[1] === 'add') {
        return _option.add;
    } else if (args[1] === 'remove') {
        return _option.remove;
    } else {
        throw new Error("Invalid Option!");
    }
}