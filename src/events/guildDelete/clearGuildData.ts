import { Client, Events, Guild } from "discord.js";
var config = require('../../../config.json');
var guildModel = require('../../model/guildModel');


module.exports = {
    execute: async (guild: Guild, client: Client) => {
        if(!guild || !client)return;

        

        const guildId = guild.id;

        await guildModel.findOneAndDelete({guildId: guildId});

    }
}