const express = require("express")
const songsSchema = require("./schemas/songs")
const { authentication } = require("./firebase-admin")
const { default: mongoose, MongooseError } = require("mongoose")
const { ObjectId } = require("bson")
const adminsSchema = require("./schemas/admins")
const app = express.Router()

// public

app.get("/songs", async (req, res) => {
    console.log("test")
    /**
     * Query Values:
        * name?: string | mongoose.FilterQuery
        * songID?: string | mongoose.FilterQuery
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
        * isMashup: boolean
        * nameLowercase: string
        * levelNameCaps: string
        * levelNameMobile: string
        * songNameCaps: string
        * songNameLowercase: string
        * songNameMobile: string
     ]
     */
    let songs = await songsSchema.find({
        name: req.query.name ?? { $exists: true },
        songID: req.query.songID ?? { $exists: true }
    }).sort({name:1})
    return res.json(songs)
})

app.get("/audio/:id", async (req, res) => {
    try {
        let song = await songsSchema.findById(req.params.id)
        return res.render("video.ejs", {audio: song.downloadUrl, name: song.name, songName: song.songName, songID: song.songID})
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
         */
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
         */
        await createTransaction(async (session) => {
            await songsSchema.updateOne({ _id: new ObjectId(req.body.id) }, {
                $set: req.body.data
            }, { session })
        }, res)
    })
    .delete(async (req, res) => {
        /**
             * id: string
         */
        await createTransaction(async (session) => {
            await songsSchema.deleteOne({ _id: new ObjectId(req.body.id) }, { session })
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