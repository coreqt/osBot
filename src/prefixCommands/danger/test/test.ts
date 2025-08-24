import { Message } from "discord.js";
import unixToRelativeTime from "../../../utils/unixToRelativeTime";
import 'dotenv/config'
var developerId = process.env.DEV_ID;
module.exports = {
    structure: {
        name: "test",
        description: "only Developer can use this",
        usage: ".."
    },
    execute: async (message: Message) => {
        if (!message || !message.channel.isSendable()) return;
        
        if (message.author.id == developerId) {
            
            
            message.reply(`${unixToRelativeTime(1755981193451)}`);
            // 1755978546
            // console.log(TimestampStyles.RelativeTime)


        } else {
            if (!message.channel.isSendable()) return;

            message.channel.send('https://tenor.com/view/my-honest-reaction-gif-10673976111485284091');
            message.channel.send('only developer can use this command!')
        };


        // Testing for Developer

        // message.channel.send(`${message.channel.nsfw}`);
    },

};