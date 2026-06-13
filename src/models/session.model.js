import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "users",
        required: [true, "User is required"]
    },
    refreshTokenHash: {
        type: String,
        required: [true, "Refresh Token is required"]
    },
    ip: {
        type: String,
        required: [true, "IP is required"]
    },
    userAgent: {
        type: String,
        required: [true, "User Agent is required"]
    },
    revoke: {
        type: Boolean,
        default: false,
        required: [true, "revoke is required"]
    },

}, {
    timestamps: true
})

const sessionModel = mongoose.model("sessions", sessionSchema)

export default sessionModel