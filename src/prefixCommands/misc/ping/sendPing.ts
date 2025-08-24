import 'dotenv/config'
import { EmbedBuilder, Message, Client } from "discord.js";
import { MongoClient } from 'mongodb';
var prefix = process.env.PREFIX || "o!";
var url = process.env.MONGO_DB_CONNECTION_STRING;
let previousTime = new Date().getTime();
let previousUsage = process.cpuUsage();
let lastUsage: any;
let invisibleEmbedColor: any = process.env.INVISIBLE_EMBED_COLOR || "#2B2D31";

function getCpuUsage() {
    const currentUsage = process.cpuUsage(previousUsage);

    previousUsage = process.cpuUsage();

    const currentTime = new Date().getTime();

    const timeDelta = (currentTime - previousTime) * 10;
    const { user, system } = currentUsage;

    lastUsage = { system: system / timeDelta, total: (system + user) / timeDelta, user: user / timeDelta };
    previousTime = currentTime;

    return lastUsage;
}


module.exports = {
    structure: {
        name: "ping",
        description: "Get Bot's Status",
        usage: `${prefix}ping`
    },
    execute: async (message: Message, client: Client) => {
        if(!message || !message.channel.isSendable() || !url)return;

        let uptime: string | undefined;
        if(client.uptime){
            let totalSeconds = (client.uptime / 1000);
            let days = Math.floor(totalSeconds / 86400);
            totalSeconds %= 86400;
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = Math.floor(totalSeconds % 60);
            uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
        }else{
            uptime = `Unable to calculate Uptime`;
        }

        
        const pingEmbed = new EmbedBuilder()
        .setColor(invisibleEmbedColor)
        .setTitle('Loading...');

        message.channel.send({ embeds: [pingEmbed] }).then(async (sentMessage: any) => {
            if (!sentMessage || !sentMessage.createdTimestamp || !message.createdTimestamp) {
                console.log('Failed to calculate ping. Message or timestamps are undefined.')
                pingEmbed.setTitle(`Failded to calculate ping`);
                sentMessage.edit({ embeds: [pingEmbed] });
                return;
            }
            
            
            const dbLatency = await measurePing(url);
            const botLatency = sentMessage.createdTimestamp - message.createdTimestamp;
            const apiLatency = client.ws.ping;

            pingEmbed.setTitle('Pong!')
            pingEmbed.addFields(
                {
                    name: 'Bot Status',
                    value: `\`\`\`Response Latency: ${botLatency}ms\nAPI Latency: ${apiLatency}ms\nDatabase Latency: ${dbLatency?.toString()}ms\nUptime: ${uptime}\`\`\``
                },
                {
                    name: 'Server Status',
                    value: `\`\`\`Ram Usage: ${Math.round(process.memoryUsage().rss / (1024 * 1024)).toString()}mb\nCPU Usage: ${Math.round(getCpuUsage().total).toString()}%\`\`\``
                }
            )
            pingEmbed.setFooter({ text: 'requested by ' + message.author.tag } );
            pingEmbed.setTimestamp();
            sentMessage.edit({ embeds: [pingEmbed] });
        }).catch((error: any) => {
            console.log("Error sending or editing message: " + error);
        });
    }
}

async function measurePing(uri: string | undefined ):Promise<number | undefined> {

    if(!uri){
        throw new Error("DataBase Connection string is missing from .env file");
        return undefined;
    }

    let latency: number | undefined;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const startTime = Date.now();
        await client.db().command({ ping: 1 });
        latency = Date.now() - startTime;
    } catch (err) {
        console.error(`Error measuring ping: ${err}`);
    } finally {
        await client.close();
    }
    return latency;
}