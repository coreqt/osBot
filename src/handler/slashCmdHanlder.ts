import fs from'node:fs'
import path from 'node:path'


module.exports = (client: _Client) => {
    client.handleSlashCommands = async () => {



        const commandFolderPath = path.join(__dirname, '..', 'slashCommands');
        const commandCategories = fs.readdirSync(commandFolderPath);

        const { slashCommands } = client;

        for (const commandCategory of commandCategories) {
            const commandCategoryPath = path.join(commandFolderPath, commandCategory);
            const commandNames = fs.readdirSync(commandCategoryPath);
            for (const commandName of commandNames) {
                const commandNamePath = path.join(commandCategoryPath, commandName);
                const commandFiles = fs.readdirSync(commandNamePath);
                for (const commandFile of commandFiles) {
                    const commandFilePath = path.join(commandNamePath, commandFile);
                    const command = require(commandFilePath);
                    if ('data' in command && 'execute' in command) {
                        slashCommands.set(command.data.name, command);
                         console.log(`✅ ${command.data.name}`);
                    } else {
                        console.log(`[WARNING] The command at ${commandFilePath} is missing a required "data" or "execute" property.`);
                    }
                }
            }
        }



    }

}