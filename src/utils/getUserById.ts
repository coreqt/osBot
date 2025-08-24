import { User } from "discord.js";

var client = require('../index').client;

async function getUserById (id: string): Promise<User> {

    let user = await client.users.fetch(id);

    if (!user.globalName) {
        user.globalName = user.username;
    }

    return user;

}

module.exports = getUserById;