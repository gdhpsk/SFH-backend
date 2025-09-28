const mongoose = require("mongoose")

const eventLimitSchema = new mongoose.Schema({
   levelID: {
    type: String,
    required: true
   },
   songName: {
    type: String,
    required: true
   },
   songAuthor: {
    type: String,
    required: true
   },
   maxLimit: {
    type: Number,
    required: true
   }
}, {id: false})

module.exports = mongoose.model("events", eventLimitSchema)