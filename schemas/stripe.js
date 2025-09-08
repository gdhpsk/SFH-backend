const mongoose = require("mongoose")

const stripeSchema = new mongoose.Schema({
    userId: String,
    paymentType: Number,
    subscriberSince: Date
}, {id: false})

module.exports = mongoose.model("payments", stripeSchema)