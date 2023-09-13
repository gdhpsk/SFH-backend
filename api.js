const express = require("express")
const songsSchema = require("./schemas/songs")
const { authentication } = require("./firebase-admin")
const { default: mongoose, MongooseError } = require("mongoose")
const { ObjectId } = require("bson")
const adminsSchema = require("./schemas/admins")
const app = express.Router()
const {Readable} = require("stream")

// public

app.get("/songs", async (req, res) => {
    /**
     * Query Values:
        * name?: string | mongoose.FilterQuery
        * songID?: string | mongoose.FilterQuery
        * format?: "gd" | "sfh"
        * id?: string
     */
    /**
     [
        * _id: string
        * name: string
        * songURL: string
        * songName: string
        * ytVideoID: string
        * songID: string
        * state: string
        * downloadUrl: string
        * levelID?: string
     ]
     */
    req.query.format = req.query.format || "sfh"
    let songs = [];
    if(req.query.id) {
        try {
            songs = [await songsSchema.findById(req.query.id).lean()]
        } catch(_){}
    } else {
        songs = await songsSchema.find({
        name: req.query.name ?? { $exists: true },
        songID: req.query.songID ?? { $exists: true }
    }).sort({name:1}).lean()
    }
    songs = songs.map(e => {
        return {
            ...e,
            downloadUrl: `https://storage.songfilehub.com/songs/${e._id.toString()}`
        }
    })
    if(req.query.format == "gd") {
        let array = []
        for(const song of songs) {
            setTimeout(() => {
                (async () => {
                    let songData = await fetch(song.downloadUrl)
                let bytes = await songData.blob()
                array.push(`1~|~${song.songID}~|~2~|~${song.songName}~|~4~|~SongFileHub~|~5~|~${Math.round(bytes.size / 10000)/100}~|~10~|~${song.downloadUrl}`)
                })()
            }, 0)
        }
        let alr = setInterval(() => {
            if(songs.length == array.length) {
                clearInterval(alr)
                res.json(array.join(":"))
            }
        }, 0)
        return
    }
    if(req.query.format == "sfh") {
    return res.json(songs)
}
return res.status(400).json({error: "400 BAD REQUEST", message: "Please input a valid format!"})
})

app.get("/audio/:id", async (req, res) => {
    try {
        let song = await songsSchema.findById(req.params.id)
        return res.render("video.ejs", {audio: `https://storage.songfilehub.com/songs/${req.params.id}`, name: song.name, songName: song.songName, songID: song.songID})
    } catch(_) {
        return res.render("video.ejs")
    }
})

// admin

async function createTransaction(cb, res) {
    let session = await mongoose.startSession()
    try {
        session.startTransaction()
        await cb(session)
        await session.commitTransaction()
        res.sendStatus(204)
    } catch (error) {
        if (error instanceof MongooseError && error.name.includes('UnknownTransactionCommitResult')) {
            res.status(500).json({ error: "500 INTERNAL SERVER ERROR", message: "Something went wrong. Please try again." })
        }
        else if (error instanceof MongooseError && error.name.includes('TransientTransactionError')) {
            res.status(500).json({ error: "500 INTERNAL SERVER ERROR", message: "Something went wrong. Please try again." })
        } else {
            res.status(500).json({ error: "400 BAD REQUEST", message: "An error may have occured in the process, rolling back information. Error:\n" + error })
        }
        await session.abortTransaction();
    } finally {
        await session.endSession()
    }
}

app.use(async (req, res, next) => {
    try {
        let getUser = await authentication.verifyIdToken(req.body.token)
        let admin = await adminsSchema.findOne({ admins: { $in: [getUser.uid] } })
        if (!admin) throw new Error()
    } catch (_) {
        return res.status(401).json({error: "401 UNAUTHORIZED", message: "You do not have access to this resource."})
    }
    return next()
})

app.post("/ping", (req, res) => {
    return res.sendStatus(204)
})

app.route("/songs")
    .post(async (req, res) => {
        /**
            * name: string
            * songURL: string
            * songName: string
            * ytVideoId: string
            * songID: string
            * state: string
            * downloadUrl: string
            * levelID?: string
         */
        req.body._id = new ObjectId()
        try {
            let data = await fetch(req.body.downloadUrl)
            if(!data.ok) throw new Error("")
            let blob = await data.blob()
            const { FormDataEncoder } = await import("form-data-encoder");
            let {FormData} = await import("formdata-node")
            let formdata = new FormData()
            formdata.set("id", req.body._id.toString())
            formdata.set("file", blob)
            let encoder = new FormDataEncoder(formdata)
            let ok = await fetch("https://storage.songfilehub.com/songs", {
                method: "POST",
                headers: encoder.headers,
                body: Readable.from(encoder)
            })
            if(!ok.ok) return res.status(500).send({error: "500 INTERNAL SERVER ERROR", message: "The cloudflare storage bucket may be having some problems. Please wait"})
        } catch(e) {
    console.log(e)
            return res.status(400).send({error: "400 BAD REQUEST", message: "This must be a valid download URL!"})
        }
        await createTransaction(async (session) => {
            await songsSchema.create([req.body], { session })
        }, res)
    })
    .patch(async (req, res) => {
        /**
             * id: string
             * data: 
                * name: string
                * songURL: string
                * songName: string
                * ytVideoId: string
                * songID: string
                * state: string
                * downloadUrl: string
                * levelID?: string
         */
        try {
            if(new URL(req.body.data.downloadUrl).hostname != "storage.songfilehub.com") {
            let data = await fetch(req.body.data.downloadUrl)
            if(!data.ok) throw new Error("")
            let blob = await data.blob()
            const { FormDataEncoder } = await import("form-data-encoder");
            let {FormData} = await import("formdata-node")
            let formdata = new FormData()
            formdata.set("id", req.body.id)
            formdata.set("file", blob)
            let encoder = new FormDataEncoder(formdata)
            await fetch("https://storage.songfilehub.com/songs", {
                method: "POST",
                headers: encoder.headers,
                body: Readable.from(encoder)
            })
        } else {
            delete req.body.data.downloadUrl
        }
        } catch(_) {
            return res.status(400).send({error: "400 BAD REQUEST", message: "This must be a valid download URL!"})
        }
        await createTransaction(async (session) => {
            await songsSchema.updateOne({ _id: new ObjectId(req.body.id) }, {
                $set: req.body.data
            }, { session, runValidators: true })
        }, res)
    })
    .delete(async (req, res) => {
        /**
             * id: string
         */
        await createTransaction(async (session) => {
            await songsSchema.deleteOne({ _id: new ObjectId(req.body.id) }, { session })
            await fetch("https://storage.songfilehub.com/songs", {
                method: "DELETE",
                headers: {
                    'content-type' : 'application/json'
                },
                body: JSON.stringify({
                    id: req.body.id
                })
            })
        }, res)
    })

app.route("/admins")
    .post(async (req, res) => {
        let { admins } = await adminsSchema.findOne()
        let users = admins.map(async e => await authentication.getUser(e))
        return res.json(await Promise.all(users))
    })
    .put(async (req, res) => {
        /**
         * uid: string
         */
        await createTransaction(async (session) => {
            await adminsSchema.updateOne({ admins: { $nin: [req.body.uid] } }, {
                $push: {
                    admins: req.body.uid
                }
            }, { session })
        }, res)
    })
    .delete(async (req, res) => {
        /**
         * uid: string
         */
        await createTransaction(async (session) => {
            if(req.body.uid != "jlUpnRgrfQPSHkVn4WKPdhqjjlP2") {
            await adminsSchema.updateOne({ admins: { $in: [req.body.uid] } }, {
                $pull: {
                    admins: req.body.uid
                }
            }, { session })
        }
        }, res)
    })

app.post("/non-admins", async (req, res) => {
    let token;
    let accs = []
    while (true) {
        let users = await authentication.listUsers(1000, token)
        accs.push(...users.users)
        if (!users.pageToken) break;
        token = users.pageToken
    }
    let { admins } = await adminsSchema.findOne()
    res.json(accs.filter(e => !admins.includes(e.uid)))
})

module.exports = app