import { ChatInputCommandInteraction, Client, MessageFlags, SlashCommandBuilder } from "discord.js"
let prefix = process.env.PREFIX || "o!";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription('Set up Counting Activity in Your Server')
        .addChannelOption((option) =>
            option
                .setName('setchannel')
                .setDescription('Set counting activity in specific channel')
                .setRequired(false)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        interaction.reply({content: `This slash command is still under development. use the prefix version of this counting command instead.\nType \`${prefix}counting enable\`\n-# consider checking our [github repo](https://github.com/coreqt/osBot) if you can contribute to it.`, flags: MessageFlags.Ephemeral})
    }
}