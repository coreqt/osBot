import { CommandInteraction, SlashCommandBuilder, CommandInteractionOptionResolver } from 'discord.js';

// Ensure DEV_ID is set in your .env file and loaded with dotenv
const developerId = process.env.DEV_ID as string;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test Command that only developer can use')
    .addBooleanOption((option) =>
      option
        .setName('test')
        .setDescription('Add test boolean')
        .setRequired(true)
    ),
  execute: async(interaction: CommandInteraction & { options: CommandInteractionOptionResolver}) => {
    if (interaction.user.id === developerId) {
      // Log specific properties for clarity
      console.dir({
        userId: interaction.user.id,
        commandName: interaction.commandName,
        testOptionValue: interaction.options.getBoolean('test'),
        guildId: interaction.guildId,
        channelId: interaction.channelId,
      }, {depth: null});

      await interaction.reply({
        content: `Test command executed! Boolean value: ${interaction.options.getBoolean('test')}`,
        ephemeral: true, // Visible only to the user
      });
    } else {
      // Single reply for non-developers
      await interaction.reply({
        content: 'Only the developer can use this command! https://tenor.com/view/my-honest-reaction-gif-10673976111485284091',
        ephemeral: true,
      });
    }
  },
};