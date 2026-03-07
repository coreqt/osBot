import {
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    MessageFlags,
    SlashCommandBuilder,
    TextChannel,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
    EmbedBuilder,
    Guild
} from "discord.js"

import { countingModel } from "../../../model/countingModel";
import { guildModel } from "../../../model/guildModel";


module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription('Set up Counting Activity in Your Server')
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('Set counting activity in specific channel')
                .setRequired(false)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        if (!interaction.client || !interaction.channel || !client.user) return;
        await interaction.deferReply();

        // interaction.reply({ content: `This slash command is still under development. use the prefix version of this counting command instead.\nType \`${prefix}counting enable\`\n-# consider checking our [github repo](https://github.com/coreqt/osBot) if you can contribute to it.`, flags: MessageFlags.Ephemeral })



        if (!interaction.memberPermissions?.has("Administrator")) {
            await interaction.editReply({ content: `Only Admins can run this command!` });
            return;
        }

        let channelId = (interaction.options.getChannel("channel") || interaction.channel).id;
        let rawChannel = await client.channels.fetch(channelId, {
            allowUnknownGuild: false,
            cache: true,
        });


        if (!rawChannel) {
            await interaction.editReply({ content: `Channel was null` });
            return;
        }


        if (rawChannel.type !== ChannelType.GuildText || !interaction.inGuild() || !interaction.guild) {
            await interaction.editReply({ content: `This command can only be used in Server.` });
            return;
        }

        const guild = interaction.guild as Guild;
        let channel = rawChannel;

        const permissions = channel.permissionsFor(client.user.id);
        if (!permissions || !permissions.has("ManageWebhooks")) {
            interaction.editReply({ content: `I don't have permissions to **ManageWebhooks**!` });
        }

        let doc = await countingModel.findOne({ guildId: guild.id });

        if (!doc) {
            doc = new countingModel({
                guildId: guild.id,
                channelId: channel.id,
            });

            await channel.setTopic(`Counting activity by OS Bot!, next number is 1`);
            await interaction.editReply({
                content: `Counting has been Enabled In this Channel!`
            });
            await doc.save();
            await createAndStoreWebhook(channel, client);

            return;
        } else {

            if (channelId != doc.channelId) {
                // let c = await client.channels.fetch(channelId, {
                //     allowUnknownGuild: false,
                //     cache: true,
                // })

                await interaction.editReply({ content: `Please select the <#${doc.channelId}> chennel to disable counting.` });
                return;
            }

            // Ai generated confirmation button. idk how to make it by myself
            const confirmBtn = new ButtonBuilder()
                .setCustomId('confirm_yes')
                .setLabel('Yes, proceed')
                .setStyle(ButtonStyle.Danger);

            const cancelBtn = new ButtonBuilder()
                .setCustomId('confirm_no')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancelBtn, confirmBtn);

            const embed = new EmbedBuilder()
                .setColor(0xff5555)
                .setTitle('Confirmation Required')
                .setDescription('This action **can cause loosing the counting progress**.\nAre you really sure?')
                .setFooter({ text: 'You have 60 seconds to decide' });

            const response = await interaction.followUp({
                embeds: [embed],
                components: [row],
            });


            const collector = response.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                componentType: ComponentType.Button,
                time: 60_000,
            });

            collector.on('collect', async (i) => {
                await i.deferUpdate();

                if (i.customId === 'confirm_yes') {
                    await i.editReply({
                        content: '**Disabling** counting acitivty...\n-# this may take a few seconds',
                        embeds: [],
                        components: [],
                    });

                    // if confirmed

                    rawChannel  = await client.channels.fetch(channelId, {
                        allowUnknownGuild: false,
                        cache: true,
                    })

                    if(!rawChannel){
                        throw new Error(`Channel was null on slashCommands/initCounting`);
                    }

                    channel = rawChannel as TextChannel;

                    await channel.setTopic("");

                    await countingModel.deleteMany({ guildId: guild.id });
                    await guildModel.findOneAndUpdate(
                        { guildId: guild.id },
                        { $unset: { webhook: 1 } },
                        { new: true }
                    )

                    // await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate work
                    await i.editReply({
                        content: ' Counting has been disabled successfully!',
                        embeds: [],
                        components: [],
                    });
                    if(!interaction.channel) throw new Error(`unable to get interaction.channel on slashCommands/initCounting`);
                    if(channel.id != interaction.channel.id){
                        channel.send({
                            content: `The Counting Activity has been disabled by <@${interaction.user.id}>`,
                            allowedMentions: {
                                users: []
                            }
                        });
                    }
                }
                else if (i.customId === 'confirm_no') {
                    await i.editReply({
                        content: ' Cancelled — no action was taken.',
                        embeds: [],
                        components: [],
                    });
                }

                collector.stop(); // Clean up
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await interaction.editReply({
                        content: ' Confirmation timed out — action cancelled.',
                        embeds: [],
                        components: [],
                    });
                }
            });


        }


    }
}

async function createAndStoreWebhook(channel: TextChannel, bot: Client) {
    if (!bot.user) return;
    const webhook = await channel.createWebhook({
        name: bot.user?.username
    })

    await guildModel.findOneAndUpdate(
        { guildId: channel.guild.id },
        {
            $set: {
                "webhook.id": webhook.id,
                "webhook.token": webhook.token,
            }
        },
        { new: true, upsert: true }
    )

    return webhook;
}