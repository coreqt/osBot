import { Message, ChannelType, EmbedBuilder } from "discord.js";
import { errorLog } from "../../../utils/sendLog";
import 'dotenv/config';

var prefix: string = process.env.PREFIX || "o!";

async function fetchMeme(subreddit: string): Promise<Meme> {
    let data: any;
    try {
        const url = "https://meme-api.com/gimme/" + subreddit;
        const response = await fetch(url);
        if (!response) {
            throw new Error(`No Response from meme api`);
        }

        data = await response.json();
        data.code = response.status;
    } catch (err: any) {
        console.log(err);
        data = {};
        data.code = 500;
        data.message = err.toString();
        errorLog(err);
    }
    return data;
}


module.exports = {
    structure: {
        name: "meme",
        description: "Get memes Through Reddit",
        usage: `${prefix}meme <subreddit>`
    },
    execute: async (message: Message) => {
        if (!message.channel.isSendable()) return;

        if (message.channel.type !== ChannelType.GuildText) {
            message.channel.send("This command Can Only be used in Server.")
            return;
        };


        const args = message.content.slice(prefix.length).trim().split(/ +/);
        args.shift();

        const Embed: EmbedBuilder = new EmbedBuilder();
        const embedColor: any = process.env.PRIMARY_EMBED_COLOR || "#FFC5D3"

        Embed.setColor(embedColor)
        if (args.length == 0) {
            Embed.setTitle(`Loading...(hint: You can also specify subreddit by ${prefix} meme [subreddit]`);
        } else {
            Embed.setTitle(`Loading...`);
        }

        message.channel.send({ embeds: [Embed] }).then(async (sentMessage: Message) => {

            if (args.length == 0) {
                var meme = await fetchMeme("");
            } else {
                let subreddit = args[0].toString();
                let containInvaildChars = validateString(subreddit);
                if (!containInvaildChars) {
                    Embed.setAuthor({ name: "This Subreddit Contains Invalid Charecters" });
                    Embed.setTitle('Error');
                    sentMessage.edit({ embeds: [Embed] });
                    return;
                }

                var meme = await fetchMeme(subreddit);
            }

            if (message.channel.type !== ChannelType.GuildText) return;
            if (meme.nsfw) { // Not safe for work i.e 18+
                if (!message.channel.nsfw) { // Not nsfw channel
                    Embed.setColor('Red')
                    Embed.setAuthor({ name: "This Meme Contains Nsfw Content." })
                    Embed.setTitle("Make sure this is a nsfw Channel before using the same command again.")
                    sentMessage.edit({ embeds: [Embed] })
                    return;
                }
            }

            if (meme.code != 200) {
                Embed.setTitle(meme.message);
                Embed.setDescription(`Error code: ${meme.code}`);
                sentMessage.edit({ embeds: [Embed] });
                return;
            }
            Embed.setTitle(meme.title);
            Embed.setURL(meme.postLink);
            Embed.setImage(meme.url);
            Embed.setFooter({ text: `r/${meme.subreddit} u/${meme.author}` });
            Embed.setTimestamp();

            sentMessage.edit({ embeds: [Embed] });

        })


    }
}


function validateString(input: string) {
    var regex = /^[a-zA-Z0-9]+$/;

    if (regex.test(input)) {
        return true;
    } else {
        return false;
    }
}

interface Meme {
    postLink: string,
    subreddit: string,
    title: string,
    url: string,
    nsfw: boolean,
    spoiler: boolean,
    author: string,
    ups: number,
    preview: string[],
    code: number
    message: string | null,
}