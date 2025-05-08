import mongoose from "mongoose";

export default mongoose.model("users", new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    creationDate: {
        type: Number,
        required: true,
        default: Date.now()
    },
    email: {
        type: String,
        required: true
    },
    watch: Array<String>,
    isSubscribed: Boolean
}, { versionKey: false }));