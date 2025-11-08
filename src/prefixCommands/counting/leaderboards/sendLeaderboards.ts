import { Message, EmbedBuilder, Client } from "discord.js";
import {countingModel} from "../../../model/countingModel";

let prefix = process.env.PREFIX || "o!";


module.exports = {
    structure: {
        name: "leaderbaords",
        description: "Sends The Global Leaderboards of the Counting",
        usage: `${prefix}leaderboards`
    },
    execute: async (message: Message, client: Client) => {
        if (!message.channel.isSendable()) return;

        const guildId = message.guild?.id


    }
}