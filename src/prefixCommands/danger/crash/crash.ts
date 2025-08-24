import { Client, Message } from "discord.js";

const developerId = process.env.DEV_ID;
module.exports = {
    structure:{
        name:"crash",
        description: "only Developer can use this",
        usage:".."
    },
    execute: async(message: Message, client: Client)=>{
        if(!message.channel.isSendable()) return;
        if(message.author.id == developerId){
            await message.channel.send("Crashed");
            await client.destroy();
            process.exit(1);
        }else{
             message.channel.send("https://tenor.com/view/aww-hell-nahh-aww-hell-aww-hell-nahh-gif-9659330954843262630")
            return;
        }
    },

};
