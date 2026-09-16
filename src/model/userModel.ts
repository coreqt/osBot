import { Schema, model } from 'mongoose';

interface CustomPrefixes {
    prefix: string;
    addedOn: Date;
}

export interface Iuser{
    userId: string;
    joinedAt: number;
    customPrefixes: CustomPrefixes[];
    lastUsedPrefix: string;
}

const userSchema = new Schema<Iuser>({
    userId: {
        type: String,
        required: [true, "userId is required"]
    },
    joinedAt: {
        type: Number,
        required: [true, "JoinedAt is required"]
    },
    customPrefixes: {
        type: [{ prefix: String, addedOn: Date }],
        default: []
    },
    lastUsedPrefix: {
        type: String,
    }
});

export const userModel = model<Iuser>("userModel", userSchema);