var mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    customPrefixes: {
        type: [{ prefix: String, addedOn: Date }],
        default: []
    },
    webhook: {
        id: String,
        token: String,
    },
    bump: {
        channelId: String,
        pingRoleIds: [],
        lastbumped: Date
    }
});

var guildModel = mongoose.model('guildModel', guildSchema);
module.exports = guildModel;
