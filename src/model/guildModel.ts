// var mongoose = require('mongoose');
import { Schema, model } from 'mongoose';


export interface Iguild {
    guildId: string;
    customPrefixes: [{
        prefix: string,
        addedOn: Date
    }] | []
    webhook: {
        id: string,
        token: string
    }
    bump: {
        channelId: string,
        pingRoleIds: [],
        lastbumped: Date
    }
}


const guildSchema = new Schema<Iguild>({
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

export const guildModel = model('guildModel', guildSchema);