var mongoose = require('mongoose');

const countingSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: [true]
    },
    channelId: {
        type: String,
        required: [true]
    },
    lastNumber: {
        type: Number,
        default: 0
    },
    lastUserId:{
        type: String,
        default: "00000000000000"
    },
    numbersOnly: {
        type: Boolean,
        default: true
    }
});

var countingModel = mongoose.model('countingModel', countingSchema);
module.exports = countingModel; 