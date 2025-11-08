import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

export interface PingedBy {
    username: Snowflake;
    channelId: Snowflake;
    messageId: Snowflake;
    timestamp: number
}

export
    interface Iafk {
    userId: string;
    reason: string | undefined;
    afkStartTime: number;
    pingedBy: PingedBy[];
    hasChangedNick: boolean;
    oldGuildNickname: string | null;
    afkGuildId: string;
}

const afkSchema = new Schema<Iafk>({
    userId: {
        type: String, required: [true, 'userId is Required']
    },
    reason: {
        type: String,
        maxLength: 220,
        default: undefined,
    },
    afkStartTime: {
        type: Number,
        default: 0,
    },
    pingedBy: [
        {
            type: String,
            default: []
        }
    ],

    hasChangedNick: {
        type: Boolean,
        default: false
    },
    oldGuildNickname: {
        type: String,
        deafult: null
    },
    afkGuildId: {
        type: String,
        required: [true, 'afkGuildId is Required']
    }
});

export const afkModel = model<Iafk>('afkModel', afkSchema);
