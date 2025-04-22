const express = require("express")
const songsSchema = require("./schemas/songs")
const { authentication } = require("./firebase-admin")
const { default: mongoose, MongooseError } = require("mongoose")
const { ObjectId } = require("bson")
const adminsSchema = require("./schemas/admins")
const app = express.Router()
const zlib = require("zlib")
const {Pool} = require("undici")

const pool = new Pool('https://storage.hpsk.me', {
    connections: 8, 
    pipelining: 1
  });

// public

app.get("/v2/songs", async (req, res) => {
    /**
     * Query Values:
        * name?: string | mongoose.FilterQuery
        * songID?: string | mongoose.FilterQuery
        * format?: "gd" | "library" | "version"
        * id?: string
        * levelID?: string
        * states?: string,string...
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
        * levelID?: string[]
     ]
     */
    req.query.format = req.query.format || "sfh"
    let songs = [];
    if(req.query.id) {
        try {
            songs = [{...(await songsSchema.findById(req.query.id).lean()), _id: req.query.id}]
        } catch(_){}
    } else {
        songs = await songsSchema.find({
        name: req.query.name ? {name: {$regex: `(?i)${req.query.name}`}} : { $exists: true },
        songID: req.query.songID ?? { $exists: true },
        levelID: req.query.levelID ? {$in: [req.query.levelID]} : { $ne: "" },
        state: req.query.states ? {$in: req.query.states.split(",")} : { $exists: true }
    }).sort({name:1}).lean()
    }
    songs = songs.map(e => {
        return {
            ...e,
            downloadUrl: `https://api.songfilehub.com/song/${e._id.toString()}?download=true&name=${e.songID}`
        }
    })
	switch(req.query.format) {
		case 'gd':
			let array = []
			for(const song of songs) {
                (async () => {
                    let songData = await pool.request({
                        path: `/api/bucket/file/${song.urlHash}?onlyMetadata=true`,
                        method: "GET"
                    })
                    let metadata = await songData.body.json()
                    array.push(`1~|~${song.songID}~|~2~|~${song.songName.replaceAll(";", ":").replaceAll(",", ".").replaceAll("|", "/")}~|~4~|~SongFileHub~|~5~|~${Math.round(metadata.size / 10000)/100}~|~10~|~${song.downloadUrl}`)
                })()
			}
           await new Promise((resolve, reject) => {
            let alr = setInterval(() => {
                if(songs.length == array.length) {
                    clearInterval(alr)
                    return resolve("")
                }
            }, 10)
           })
            return res.json(array.join(":"))
		case 'library':
            songs = songs.filter(e => ["rated", "unrated", "challenge"].includes(e.state))
			let songsString = '';
			let tagsDictionary = {rated: 0, unrated: 1, challenge: 2};
            let tagsArray = ['800000,Rated', '800001,Unrated', '800002,Challenge'];
			let tag = '';
            let count = 0;
			for(const song of songs) {
				(async () => {
					let songData = await pool.request({
                        path: `/api/bucket/file/${song.urlHash}?onlyMetadata=true`,
                        method: "GET"
                    })
					let metadata = await songData.body.json()
					tag = '.80000' + tagsDictionary[song.state] + '.';
					songsString += `${song.songID},${song.songName.replaceAll(";", ":").replaceAll(",", ".").replaceAll("|", "/")},800006,${metadata.size},0,${tag},0, , , ,0;`
                    count++;
				})()
			}
            await new Promise((resolve, reject) => {
                let alr = setInterval(() => {
                    if(songs.length == count) {
                        clearInterval(alr)
                        return resolve("")
                    }
                }, 10)
               })
			let libraryVersion = songs.length;
			let library = libraryVersion + '|800006,SongFileHub;|' + songsString + '|800000,Rated;800001,Unrated;800002,Challenge|'
			var deflated = zlib.deflateSync(library).toString("base64url");
			return res.send(deflated);
        case 'version':
            return res.json(songs.filter(e => ["rated", "unrated", "challenge"].includes(e.state)).length);
		default:
			return res.json(songs);
	}
})

app.get("/songs", async (req, res) => {
    /**
     * Query Values:
        * name?: string | mongoose.FilterQuery
        * songID?: string | mongoose.FilterQuery
        * format?: "gd" | "sfh"
        * id?: string
        * levelID?: string
        * states?: string,string...
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
            songs = [{...(await songsSchema.findById(req.query.id).lean()), _id: req.query.id}]
        } catch(_){}
    } else {
        songs = await songsSchema.find({
        name: req.query.name ?? { $exists: true },
        songID: req.query.songID ?? { $exists: true },
        levelID: req.query.levelID ? {$in: [req.query.levelID]} : { $ne: "" },
        state: req.query.states ? {$in: req.query.states.split(",")} : { $exists: true }
    }).sort({name:1}).lean()
    }
    songs = songs.map(e => {
        return {
            ...e,
            levelID: e.levelID?.[0],
            downloadUrl: `https://api.songfilehub.com/song/${e._id.toString()}?download=true&name=${e.songID}`
        }
    })
    if(req.query.format == "gd") {
        let array = []
        for(const song of songs) {
            (async () => {
                let songData = await pool.request({
                    path: `/api/bucket/file/${song.urlHash}?onlyMetadata=true`,
                    method: "GET"
                })
                let metadata = await songData.body.json()
                array.push(`1~|~${song.songID}~|~2~|~${song.songName}~|~4~|~SongFileHub~|~5~|~${Math.round(metadata.size / 10000)/100}~|~10~|~${song.downloadUrl}`)
            })()
        }
        let alr = setInterval(() => {
            if(songs.length == array.length) {
                clearInterval(alr)
                res.json(array.join(":"))
            }
        }, 10)
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
        return res.render("video.ejs", {audio: `https://api.songfilehub.com/song/${req.params.id}`, name: song.name, songName: song.songName, songID: song.songID})
    } catch(_) {
        return res.render("video.ejs")
    }
})

const http = require('https');

app.get("/song/:id", async (req, res) => {
    try {
        let song = await songsSchema.findByIdAndUpdate(req.params.id, {
            $inc: {
                downloads: req.query.download && !req.query.onlyMetadata ? 1 : 0
            }
        })
        if(!song) throw new Error()
        res.set({range: req.header("range") || "", "user-agent": req.header("user-agent") || ""})
        return res.redirect(`https://storage.hpsk.me/api/bucket/file/${song.urlHash}${Object.keys(req.query).length ? `?${new URLSearchParams(req.query).toString()}` : ``}`)
    } catch(_) {
        return res.status(404).json({error: "404 NOT FOUND", message: "Could not find the Object ID"})
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
        if(req.body.token == process.env.SUPER_SECRET) return next()
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
            * filetype: string
         */
        req.body._id = new ObjectId()
        req.body.filetype ||= "mp3"
        await createTransaction(async (session) => {
            if(!["loop"].includes(req.body.state) && !req.body.levelID) throw new Error("You must specify a level ID for this type of song!")
            req.body.urlHash = "LMAO"
            if(["loop"].includes(req.body.state)) {
                req.body.levelID = process.env.levelSecret
            }
            req.body.levelID = [req.body.levelID]
            if(!req.body.songURL) {
                req.body.songURL = `https://www.newgrounds.com/audio/listen/${req.body.songID}`
            }
            let song = await songsSchema.create([req.body], { session })
                let data = await fetch(req.body.downloadUrl)
                if(!data.ok) throw new Error("Invalid Download URL!")
                let buffer = new Uint8Array(await data.arrayBuffer())
                let key = ""
                await fetch("https://storage.hpsk.me/api/bucket/ping")
                for(let i = 0; i < buffer.length; i += 8000000) {
                    let arr = Array.from(buffer.slice(i, i+8000000))
                    let token = await fetch(`https://storage.hpsk.me/api/bucket/file/a80161badffd?name=${req.body._id.toString()}.${req.body.filetype}`, {
                        method: "POST",
                        headers: {
                            Cookie: "token="+process.env.token,
                            'content-type': "application/json",
                            "x-secret-token": key
                        },
                        body: JSON.stringify(arr)
                    })
                    if(!token.ok) {
                        let data = await token.json()
                        console.log(data)
                        throw new Error(data.message)
                    }
                    if(i == 0) {
                        let data = await token.json()
                        key = data.key
                    }
                }
                let end = await fetch(`https://storage.hpsk.me/api/bucket/file/a80161badffd?name=${req.body._id.toString()}.${req.body.filetype}`, {
                        method: "POST",
                        headers: {
                            Cookie: "token="+process.env.token,
                            'content-type': "text/plain",
                            "x-secret-token": key
                        },
                        body: "END"
                    })
                    if(!end.ok) {
                        let data = await end.json()
                        console.log(data)
                        throw new Error(data.message)
                    }
                    let {hash} = await end.json()
                    req.body.urlHash = hash
                    await songsSchema.findByIdAndUpdate(song[0]._id.toString(), {
                        $set: {
                            urlHash: hash
                        }
                    }, { session })
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
                * filetype: string
         */
        if(["api.songfilehub.com", "storage.hpsk.me"].includes(new URL(req.body.data.downloadUrl).hostname)) {
            delete req.body.data.downloadUrl
        }
        await createTransaction(async (session) => {
            let song = await songsSchema.findById(req.body.id)
            if(!["loop"].includes(req.body.data.state ?? song.state) && !(req.body.data.levelID?.length ?? song.levelID?.length)) throw new Error("You must specify a level ID for this type of song!")
            if(["loop"].includes(req.body.state)) {
                req.body.data.levelID = [process.env.levelSecret]
            }
            if(!["mashup", "remix", "loop"].includes(req.body.data.state)) {
            let duplicates = await songsSchema.aggregate([
                {
                  '$match': {
                    'levelID': {
                      '$in': req.body.data.levelID
                    },
                    'state': {
                        '$nin': ["mashup", "remix", "loop"]
                    },
                    '_id': {
                        '$ne': new ObjectId(req.body.id)
                    }
                  }
                }, {
                  '$unwind': {
                    'path': '$levelID'
                  }
                }, {
                  '$group': {
                    '_id': '0', 
                    'levelID': {
                      '$push': '$levelID'
                    }
                  }
                }, {
                  '$project': {
                    'levelID': {
                      '$setIntersection': [
                        '$levelID', req.body.data.levelID
                      ]
                    }
                  }
                }
              ])
              if(duplicates.length) {
                throw new Error(`Duplicate level IDs: ${duplicates[0].levelID.join(", ")}`)
              }
            }
            if(!req.body.data.downloadUrl) {
                delete req.body.data.downloadUrl
            }
            await songsSchema.findByIdAndUpdate(req.body.id, {
                $set: req.body.data
            }, { session , runValidators: true})
                if(req.body.data.downloadUrl) {
                let data = await fetch(req.body.data.downloadUrl)
                if(!data.ok) throw new Error("Invalid download URL!")
                if(song && req.body.data.filetype && song.filetype != req.body.data.filetype) {
                    await fetch(`https://storage.hpsk.me/api/bucket/file/${song.urlHash}`, {
                        method: "DELETE",
                        headers: {
                            Cookie: "token="+process.env.token,
                            'content-type': "application/json",
                            "x-secret-token": key
                        }
                    })
                }
                let buffer = new Uint8Array(await data.arrayBuffer())
                let key = ""
                await fetch("https://storage.hpsk.me/api/bucket/ping")
                for(let i = 0; i < buffer.length; i += 8000000) {
                    let arr = Array.from(buffer.slice(i, i+8000000))
                    let token = await fetch(`https://storage.hpsk.me/api/bucket/file/a80161badffd?${i == 0 ? 'overwrite=true&' : ''}name=${req.body.id.toString()}.${req.body.data.filetype || song.filetype}`, {
                        method: "POST",
                        headers: {
                            Cookie: "token="+process.env.token,
                            'content-type': "application/json",
                            "x-secret-token": key
                        },
                        body: JSON.stringify(arr)
                    })
                    if(!token.ok) {
                        let data = await token.json()
                        console.log(data)
                        throw new Error(data.message)
                    }
                    if(i == 0) {
                        let data = await token.json()
                        key = data.key
                    }
                }
                let end = await fetch(`https://storage.hpsk.me/api/bucket/file/a80161badffd?name=${req.body.id.toString()}.${req.body.data.filetype || song.filetype}`, {
                        method: "POST",
                        headers: {
                            Cookie: "token="+process.env.token,
                            'content-type': "text/plain",
                            "x-secret-token": key
                        },
                        body: "END"
                    })
                    if(!end.ok) {
                        let data = await end.json()
                        console.log(data)
                        throw new Error(data.message)
                    }
                    let {hash} = await end.json()
                    req.body.data.urlHash = hash
            }
        }, res)
    })
    .delete(async (req, res) => {
        /**
             * id: string
         */
        await createTransaction(async (session) => {
            let {urlHash} = await songsSchema.findOneAndDelete({ _id: new ObjectId(req.body.id) }, { session })
            await fetch("https://storage.hpsk.me/api/bucket/ping")
            let end = await fetch("https://storage.hpsk.me/api/bucket/file/" + urlHash, {
                method: "DELETE",
                headers: {
                    Cookie: "token="+process.env.token
                }
            })
            if(!end.ok) {
                let data = await end.json()
                console.log(data)
                throw new Error(data.message)
            }
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
