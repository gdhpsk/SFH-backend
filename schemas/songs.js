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
                await fetch(v)
                return true
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
            validator: v => ["rated", "unrated", "mashup", "challenge", "remix", "loop"].includes(v),
            message: "Not a valid state!"
        }
    },
    filetype: {
        type: String,
        required: true,
        validate: {
            validator: v => ["mp3", "ogg"].includes(v),
            message: "Not a valid file type!"
        }
    },
    downloadUrl: {
        type: String,
        required: true
    },
    downloads: Number,
    levelID: {
        type: [String],
        required: true,
        validate: {
            validator: async v => {
                if(!v.length) return false;
                return true
            },
            message: "Not a valid level ID!"
        }
    },
}, {
    id: false
})

module.exports = mongoose.model("songs", songsSchema)