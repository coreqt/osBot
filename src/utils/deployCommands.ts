import { REST, Routes } from 'discord.js';
import fs, { mkdirSync } from 'node:fs'
import path from 'node:path'

const commands: any[] = [];

const commandFolderPath = path.join(__dirname, '..', 'slashCommands');
const commandCategories = fs.readdirSync(commandFolderPath);


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
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${commandFilePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}





// Grab all the command folders from the commands directory you created earlier
// 

// Construct and prepare an instance of the REST module


// **LEGACY CODE**
// async function deployCommands(clientId: string, token: string): Promise<void> {



//     const rest = new REST().setToken(token);

//     // and deploy your commands!
//     try {
//         console.log(`Started refreshing ${commands.length} application (/) commands.`);

//         // The put method is used to fully refresh all commands in the guild with the current set
//         const data: any = await rest.put(
//             Routes.applicationCommands(clientId),
//             { body: commands },
//         );

//         console.log(`Successfully reloaded ${data.length} application (/) commands.`);
//     } catch (error) {
//         // And of course, make sure you catch and log any errors!
//         console.error(error);
//     }

// }
  

async function deployCommands(clientId: string, token: string, guildId?: string): Promise<void> {
    const rest = new REST().setToken(token);
    const cachePath = path.join(__dirname, '..', '..', 'cache');
    
    if(!fs.existsSync(cachePath)){
        fs.mkdirSync(cachePath);
    }
    
    const deployedCommandsPath = path.join(cachePath, 'last-deployed.json');

    return new Promise((resolve, reject) => {
        let lastDeployed: any[] = [];
        
        fs.readFile(deployedCommandsPath, 'utf-8', (err, fileContent) => {
            if (!err && fileContent) {
                try {
                    lastDeployed = JSON.parse(fileContent);
                } catch (parseError) {
                    console.log('Error parsing last-deployed.json. Treating as first deployment.');
                }
            } else {
                console.log('No previous deployment file found. Treating as first deployment.');
            }

            const currentCommandsJSON = JSON.stringify(commands);
            const lastDeployedJSON = JSON.stringify(lastDeployed);

            if (currentCommandsJSON === lastDeployedJSON) {
                console.log('No changes in commands detected. Skipping deployment.');
                resolve();
                return;
            }

            const route = guildId
                ? Routes.applicationGuildCommands(clientId, guildId)
                : Routes.applicationCommands(clientId);

            console.log(`Started refreshing ${commands.length} application (/) commands ${guildId ? `for guild ${guildId}` : 'globally'}.`);

            rest.put(route, { body: commands })
                .then((data: any) => {
                    console.log(`Successfully reloaded ${data.length} application (/) commands ${guildId ? `for guild ${guildId}` : 'globally'}.`);

                    fs.writeFile(deployedCommandsPath, currentCommandsJSON, (writeErr) => {
                        if (writeErr) {
                            console.error('Error writing to last-deployed.json:', writeErr);
                            reject(writeErr);
                            return;
                        }
                        console.log('Saved deployed commands to last-deployed.json.');
                        resolve();
                    });
                })
                .catch((error) => {
                    console.error('Error deploying commands:', error);
                    reject(error);
                });
        });
    });
}

export { deployCommands }