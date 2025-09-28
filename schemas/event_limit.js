const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema({
   userID: {
    type: String,
    required: true
   },
   count: {
    type: Number,
    required: true
   }
}, {id: false})

module.exports = mongoose.model("event_limits", eventSchema)