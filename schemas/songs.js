const mongoose = require("mongoose")

const songsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    songURL: {
        type: String,
        required: true,
        validate: {
            validator: async v => {
                if(!v) return true
                let exists = await fetch(v)
                return exists.ok
            },
            message: "Not a valid video"
        }
    },
    urlHash: {
        type: String,
        required: true
    },
    songName: {
        type: String,
        required: true
    },
    ytVideoID: {
        type: String,
        required: true,
        validate: {
            validator: async v => {
                let exists = await fetch("https://youtube.com/watch?v="+v)
                return exists.ok
            },
            message: "Not a valid youtube video"
        }
    },
    songID: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        validate: {
            validator: v => ["rated", "unrated", "mashup", "challenge", "remix"].includes(v),
            message: "Not a valid state!"
        }
    },
    downloadUrl: {
        type: String,
        required: true
    },
    levelID: {
        type: String,
        required: true,
        validate: {
            validator: async v => {
                if(!v) return true;
                let exists = await fetch(`https://gdbrowser.com/api/search/${v}?page=0&count=10`)
                return exists.ok
            },
            message: "Not a valid level ID!"
        }
    },
}, {
    id: false
})

module.exports = mongoose.model("songs", songsSchema)