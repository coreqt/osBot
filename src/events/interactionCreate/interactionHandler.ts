import { CommandInteraction, MessageFlags, EmbedBuilder } from "discord.js";

module.exports = {
    execute: async (interaction: CommandInteraction, client: _Client) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        } finally {
            const logChannelId = process.env.COMMAND_EXECUTION_LOG_CHANNEL_ID;

            if (!logChannelId) {
                throw new Error(
                    "COMMAND_EXECUTION_LOG_CHANNEL_ID is not provided in .env file"
                );
            }

            const channel = client.channels.cache.get(logChannelId);
            if (!channel || !channel.isSendable())
                throw new Error("Unable to Fetch executeChannel in prefixHandler.ts");
            const logEmbed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({
                    name: `${interaction.user.username}`,
                    iconURL: validateIconURL(interaction.user.avatarURL()),
                })
                .setTitle(interaction.guild?.name || interaction.user.globalName)
                .setThumbnail(interaction.guild?.iconURL() || interaction.user.avatarURL())
                .setDescription(interaction.commandName)
                .addFields(
                    {
                        name: "Global Name",
                        value: `${interaction.user.globalName}`,
                        inline: true,
                    },
                    { name: "Username", value: interaction.user.username, inline: true },
                    { name: "User Id", value: interaction.user.id, inline: true },
                    // { name: '\u200B', value: '\u200B' },
                    { name: "Gulid Name", value: interaction.guild?.name || interaction.user.displayName, inline: true },
                    { name: "Gulid Id", value: interaction.guild?.id || interaction.user.id, inline: true }
                )
                .setTimestamp();
            channel.send({ embeds: [logEmbed] });
        }

    }
}

function validateIconURL(url: string | null): string | undefined {
    if (!url || url === "null") return undefined;
    try {
        new URL(url);
        return url;
    } catch {
        return undefined;
    }
}
