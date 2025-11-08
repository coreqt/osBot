// var mongoose = require('mongoose');
import { Schema, model } from 'mongoose';


export interface Icounting {
    guildId: string;
    channelId: string;
    lastNumber: number;
    lastUserId: string | "00000000000000";
    numbersOnly: boolean;
}

const countingSchema = new Schema<Icounting>({
    guildId: {
        type: String,
        required: [true, 'guildId is Required']
    },
    channelId: {
        type: String,
        required: [true, 'channelId is Required']
    },
    lastNumber: {
        type: Number,
        default: 0
    },
    lastUserId: {
        type: String,
        default: "00000000000000"
    },
    numbersOnly: {
        type: Boolean,
        default: true
    }
});

export const countingModel = model('countingModel', countingSchema);