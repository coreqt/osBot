var client = require('../index').client;

async function getUserByRawMessage(rawUserId: string) {

    const mentionedUser = rawUserId;
    const userIdRegExp = /<@(\d+)>/;
    const userId = mentionedUser.match(userIdRegExp);
    if(!userId) return null;
    let user = await client.users.fetch(userId?.[1]);

    if (!user.globalName) {
        user.globalName = user.username;
    }

    return user;

}

module.exports = getUserByRawMessage;


