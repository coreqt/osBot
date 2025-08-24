import {Schema, model} from 'mongoose';


const afkSchema = new Schema<AfkDoc>({
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
    pingedBy: {
        type: [],
        default: []
    },
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

const afkModel = model<AfkDoc>('afkModel', afkSchema);
export default afkModel;