var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true]
    },
    joinedAt: {
        type: Date,
        required: [true]
    },
    customPrefixes: {
        type: [{ prefix: String, addedOn: Date }],
        default: []
    },
    lastUsedPrefix: {
        type: String,
    }
});

var userModel = mongoose.model('userModel', userSchema);
module.exports = userModel; 