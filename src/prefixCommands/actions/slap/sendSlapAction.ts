var send = require('../../../utils/sendActionEmbed');
var config = require('../../../../config.json');
var getUserById = require('../../../utils/getUserByRawMessage');
import 'dotenv/config'
let prefix = process.env.PREFIX || "o!";

module.exports = {
    structure: {
        name: "slap",
        description: "Slap Someone When Your Are Angry On Him/Her",
        usage: `${prefix}slap <mention>`
    },
    execute: async (message: any) => {
        const args = await message.content.slice(prefix.length).trim().split(/ +/);
        args.shift();

        let mentionedUser = message.mentions.users.first();

        if (args.length != 1 && args.length < 1 || !mentionedUser) {
            message.reply(`INVAILD ARGS! use \`${prefix}slap @user\``);
            return;
        }


        send(message, 'slap', `${message.author.globalName}'s hand meets ${mentionedUser.globalName}'s cheek with a sharp slap, a moment of tension between them`);

    }
}

