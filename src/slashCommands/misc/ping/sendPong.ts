import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, InteractionResponse, Client } from "discord.js";
import { MongoClient } from "mongodb";
let url = process.env.MONGO_DB_CONNECTION_STRING;
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

async function measurePing(uri: string | undefined): Promise<number | undefined> {

	if (!uri) {
		throw new Error("DataBase Connection string is missing from .env file");
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

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	execute: async(interaction: ChatInputCommandInteraction, client: Client) => {
		if (!interaction.isChatInputCommand()) return;

		let pingEmbed = new EmbedBuilder()
			.setColor(invisibleEmbedColor)
			.setTitle('Loading...');

		try {


			let uptime: string | undefined;
			if (client.uptime) {
				let totalSeconds = (client.uptime / 1000);
				let days = Math.floor(totalSeconds / 86400);
				totalSeconds %= 86400;
				let hours = Math.floor(totalSeconds / 3600);
				totalSeconds %= 3600;
				let minutes = Math.floor(totalSeconds / 60);
				let seconds = Math.floor(totalSeconds % 60);
				uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
			} else {
				uptime = `Unable to calculate Uptime`
			}



			let after = 0;
			const before = Date.now();
			await interaction.reply({ embeds: [pingEmbed] }).then((response:InteractionResponse) =>{
				after = Date.now();
			} )



			const msgLatency = after - before
			const dbLatency = await measurePing(url);
			const apiLatency = client.ws.ping;

			pingEmbed.setTitle('Pong!')
			pingEmbed.addFields(
				{
					name: 'Bot Status',
					value: `\`\`\`Response Latency: ${msgLatency}ms\nAPI Latency: ${apiLatency}ms\nDatabase Latency: ${dbLatency?.toString()}ms\nUptime: ${uptime}\`\`\``
				},
				{
					name: 'Server Status',
					value: `\`\`\`Ram Usage: ${Math.round(process.memoryUsage().rss / (1024 * 1024)).toString()}mb\nCPU Usage: ${Math.round(getCpuUsage().total).toString()}%\`\`\``
				}
			)
			pingEmbed.setFooter({ text: 'requested by ' + interaction.user.tag });
			pingEmbed.setTimestamp();
			interaction.editReply({ embeds: [pingEmbed] });


		} catch (error) {
			console.error(error);
			pingEmbed.setColor("Red")
			pingEmbed.setTitle(`Failed to calulate ping`);
			interaction.editReply({ embeds: [pingEmbed] });
			return;
		}


	}


};