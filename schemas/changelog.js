const mongoose = require("mongoose")

const changelogStruct = new mongoose.Schema({
    title: String,
    songName: String,
    author: String
})

const changelogSchema = new mongoose.Schema({
    userID: String,
    id: String,
    changes: [changelogStruct],
    createdAt: {
        type: Date,
        expires: 60
    }
})

module.exports = mongoose.model("changelog", changelogSchema)