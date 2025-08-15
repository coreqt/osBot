import { Message, EmbedBuilder, TimestampStyles, Client, PermissionsBitField } from "discord.js";
import 'dotenv/config';
import { boolean } from "mathjs";

var afkDoc = require('../../../model/afkModel.js');
var prefix = process.env.PREFIX || "o!";

module.exports = {
    structure: {
        name: "afk",
        description: "You can your status To Afk. So when someone pings you or replies to your message They will get notified That you are afk with the reason that You've Provided",
        usage: `${prefix}afk <reason>`
    },
    execute: async (message: Message, client: any) => {
        if (!message.channel.isSendable() || !message.guild || message.channel.isDMBased() || !message.guild.members.me || !message.member?.roles.highest.position) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const userid = message.author.id;


        const clientPerms = message.guild.members.me.permissions;
        let changeNick = false;


        if (clientPerms.has("ManageNicknames")) {
            changeNick = true;


            if (message.member?.roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position) {
                changeNick = false;

                const note = await message.channel.send(`Auto AFK Nickname Feature wont work. Please Put my role Above yours to make it workable.`);
                setTimeout(() => note.delete(), 7000);

            }

        } else {
            changeNick = false;
            message.channel.send('I don\'t have permission to change your nickname!');
        }




        var _reason: string | undefined;
        var hasMatch: boolean = false;
        args.shift();
        if (args.length == 0) {
            _reason = undefined;
        } else {
            const regex = /@everyone|<\@\d+>|<\@\&\d+>/;
            _reason = args.join(" ");
            hasMatch = regex.test(_reason);
        }



        if (_reason && _reason.length > 220 || hasMatch || _reason && !isValidAscii(_reason)) {

            const embedColor: any = process.env.ALERT_EMBED_COLOR || "#ff6347";

            let embed: EmbedBuilder = new EmbedBuilder()
                .setColor(embedColor)
                // .setDescription(`The Length of Reason Must be less than 220 letters(including spaces) and also it shouldn't be containing any mentions`)
                .addFields({ name: `Reason String contains invaild character`, value: `- It's length must be less than 220 letters(including spaces)\n- It shouldn't be containing any mentions\n- It must only contain ASCII letters.` })
                .setTimestamp();


            const msg = await message.reply({ embeds: [embed] });



            setTimeout(() => {
                if(msg.deletable){
                    msg.delete();
                }
            }, 10000);

            _reason = undefined;
        }

        const a = message.createdTimestamp;
        const timeStamp = (a / 1000) | 0;

        let authorName = message.author.displayName;


        if (message.member.nickname) {
            authorName = message.member.nickname;
        }


        try {
            await afkDoc.deleteMany({ userId: userid });
            const newDoc = new afkDoc({
                userId: userid,
                reason: _reason, afkStartTime: timeStamp,
                oldServerNickname: message.member.nickname,
                afkGuildId: message.guild.id,
                hasChangedNick: changeNick
            });
            // comment

            await newDoc.save();
        } catch (err) {
            let embedColor: any = process.env.ALERT_EMBED_COLOR || "#ff6347";

            console.log("Error in afk.js " + err);
            let embed: EmbedBuilder = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(`[500] Internal Server Error`)
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
            return;
        }

        let name: string | null
        if (message.author.globalName) {
            name = message.author.globalName;
        } else {
            name = message.author.username;
        }
        let msgString = `<@${message.author.id}> Marked you as AFK${_reason ? `: ${_reason}` : ""}`;

        try {

            if (changeNick) {
                const member = message.guild.members.cache.get(message.author.id);
                if (!member) {
                    throw new Error("Member is empty");
                }
                await member.setNickname(`[AFK] ${authorName}`);
            }

        } catch (err) {

            if (message.author.id === message.guild.ownerId) {

                const note = await message.reply(`❌  I can't change the server owner's nickname to mark AFK.`);
                setTimeout(() => note.delete(), 7000);

            } else {

                const note = await message.reply(`❌ Unable to change Nickname back to normal. Please try to put my role Above yours to make it workable.`);
                setTimeout(() => note.delete(), 7000);
            }

        }

        message.channel.send(msgString);
        return;
    }


}

function isValidAscii(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (charCode < 0 || charCode > 127) {
            return false;
        }
    }

    return true;
}