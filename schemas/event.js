const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema({
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
   }
}, {id: false})

module.exports = mongoose.model("events", eventSchema)