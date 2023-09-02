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
                return !exists.ok
            },
            message: "Not a valid video"
        }
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
                return exists.status != 404
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
            validator: v => ["rated", "unrated", "mashup", "challenge"].includes(v),
            message: "Not a valid state!"
        }
    },
    downloadUrl: {
        type: String,
        required: true
    }
}, {
    id: false,
    toJSON: {virtuals: true},
    virtuals: {
        isMashup: {
            get() {
                return this.state == "mashup"
            }
        },
        nameLowercase: {
            get() {
                return this.name.toLowerCase()
            }
        },
        levelNameCaps: {
            get() {
                return this.name.toUpperCase()
            }
        },
        levelNameMobile: {
            get() {
                return `${this.name.toUpperCase()[0]}${this.name.toUpperCase().substring(1)}`
            }
        },
        songNameCaps: {
            get() {
                return this.songName.toUpperCase()
            }
        },
        songNameLowercase: {
            get() {
                return this.songName.toLowerCase()
            }
        },
        songNameMobile: {
            get() {
                return `${this.songName.toUpperCase()[0]}${this.songName.toUpperCase().substring(1)}`
            }
        },
    }
})

module.exports = mongoose.model("songs", songsSchema)