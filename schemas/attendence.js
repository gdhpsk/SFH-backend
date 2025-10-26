const mongoose = require("mongoose")
const { getLatestSunday } = require("../helper")

const attendenceSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    latestSunday: {
        type: Date,
        required: true,
        default: getLatestSunday()
    },
    rejected: {
        type: Number,
        required: true,
        default: 0
    },
    accepted: {
        type: Number,
        required: true,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
})

module.exports = mongoose.model("attendences", attendenceSchema)