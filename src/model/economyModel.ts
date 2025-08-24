var mongoose = require('mongoose');

const economySchema = new mongoose.Schema({
    userId: {
        type: String, required: [true]
    },
    xp: {
        type: Number,
        default: 1,
    },
    moneyInPocketCount: {
        type: Number,
        default: 5000
    },
    moneyInBankCount: {
        type: Number,
        default: 500,
    },
    bankInterest: {
        type: Number,
        default: 2
    },
    lastDepositeDate: {
        type: String,
        default: 0,
    },

    currentJob: {
        type: String,
        default: "none",
    },
    jobLevel: {
        type: Number,
        default: 1
    },
    jobSalary: {
        type: Number,
        default: 750,
    },
    lastWorkShift: {
        type: String,
        default: 0
    },
    isCollectedDaily: {
        type: Boolean,
        default: false,
    },
});

var economyModel = mongoose.model('economyModel', economySchema);
module.exports = economyModel; 