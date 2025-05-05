const mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema({
    "userID": {
      "type": String
    },
    "name": {
      "type": String
    },
    "author": {
      "type": String
    },
    "downloads": {
      "type": Number
    },
    "songID": {
      "type": String
    },
    "levelID": {
      "type": String
    },
    "state": {
      "type": String
    },
    "songURL": {
      "type": String
    },
    "showcase": {
      "type": String
    },
    "songName": {
      "type": String
    },
    "songAuthor": {
      "type": String
    },
    "mashupName": {
      "type": String
    },
    "mashupAuthor": {
      "type": String
    },
    "remixName": {
      "type": String
    },
    "remixAuthor": {
      "type": String
    },
    "remixInfo": {
      "type": String
    },
    threadChannel: {
        type: String
    },
    duplicate: {
        type: Boolean
    },
    texturePackCreator: {
        type: String
    },
    tags: {
        type: [String]
    },
    menuType: {
        type: String
    },
    "comments": {
      "type": String,
      default: ""
    },
    "DMchannel": {
      "type": String
    },
    "DMmessage": {
      "type": String
    },
    "webhookMessage": {
      "type": String
    },
    "webhookURL": {
      "type": String
    }
  }, {
    id: false
})

module.exports = mongoose.model("submissions", submissionSchema)