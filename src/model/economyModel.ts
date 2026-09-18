// var mongoose = require('mongoose');
import { Snowflake } from "discord.js";
import { number } from "mathjs";
import {Schema, model} from "mongoose"


export interface Ieconomy{
    userId: Snowflake;
    xp: number;
    moneyInPocketCount: number;
    moneyInBankCount: number;
    bankInterest: number;
    lastDepositeDate: number;
    currentJob: string;
    jobLevel: number;
    jobSalary: number;
    lastWorkShift: number;
    isCollectedDaily: boolean;
}


const economySchema = new Schema<Ieconomy>({
    userId: {
        type: String, required: [true, "userId is required"]
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
        type: Number,
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
        type: Number,
        default: 0
    },
    isCollectedDaily: {
        type: Boolean,
        default: false,
    },
});

export const economyModel = model<Ieconomy>('economyModel', economySchema);
