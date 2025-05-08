import mongoose from "mongoose";

export default mongoose.model("blacklisted-tokens", new mongoose.Schema({
    token: {
        type: String,
        required:true
    },
    expDate: {
        type: Number,
        required:true
    }
}));