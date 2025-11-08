import { Client, Snowflake, User } from "discord.js";

export { }

declare global {
    interface Command {
        structure: {
            name: string;
            description: string;
            usage: string;
            [key: string]: any;
        };
        execute: (message: Message, client?: ExtendedClient, args?: string[]) => Promise<void> | void;
    }

    interface _Client extends Client {
        prefixCommands: Collection<string, Command>;
        slashCommands: Collection<string, Command>;

        // To be assigned by eventHandler
        handleEvents: () => Promise<void>;
        handlePrefixCommands: () => Promise<void>;
        handleSlashCommands: () => Promise<void>;
    }


}