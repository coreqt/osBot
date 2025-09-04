import fs from'node:fs'
import path from 'node:path'

module.exports = (client: _Client) => {
    client.handlePrefixCommands = async () => {
        const commandFolderPath = path.join(__dirname, '..', 'prefixCommands');
        const commandCategories = fs.readdirSync(commandFolderPath);

        const { prefixCommands } = client;

        for (const commandCategory of commandCategories) {
            const commandCategoryPath = path.join(commandFolderPath, commandCategory);
            const commandNames = fs.readdirSync(commandCategoryPath);
            for( const commandName of commandNames){
                const commandNamePath = path.join(commandCategoryPath, commandName);
                const commandFiles = fs.readdirSync(commandNamePath);
                for(const commandFile of commandFiles){
                    const commandFilePath = path.join(commandNamePath, commandFile);
                    try{
                        const command = require(commandFilePath);
                        
                        prefixCommands.set(commandName, command);
                        
                        console.log(`✅ ${commandName}`);
                    }catch(error){
                        console.log(`❌️ ${commandName}`)
                    }
                }
            }
        }
    }
}