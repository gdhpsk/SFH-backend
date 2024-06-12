const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const app = express()
const {WebSocketServer} = require("ws")
const songs = require("./schemas/songs")
const http_server = require("http").createServer(app)

let map = new Map()

if(!process.env.MONGODB_URI) {
    dotenv.config()
}

mongoose.connect(process.env.MONGODB_URI, {
    dbName: "SFH",
    readPreference: "primaryPreferred",
    authSource: "$external",
    authMechanism: "MONGODB-X509",
    tlsCertificateKeyFile: process.env.keyPath
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.set("view engine", "ejs")

app.get("/socket", async (req, res) => {
    let uuid = crypto.randomUUID()
    map.set(uuid, {object: "", invalidate: Date.now() + 20000})
    return res.send(uuid)
})

app.get("/socket/poll/:id", async (req, res) => {
    let sock = map.get(req.params.id)
    if(!sock) return res.status(400).json({error: "400 BAD REQUEST", message: "Could not find socket."})
    if(sock.invalidate-10000 > Date.now()) return res.sendStatus(400)
    map.set(req.params.id, {
        ...sock,
        invalidate: sock.object ? 0 : Date.now()+20000
    })
    return res.status(200).json([sock.object])
})

app.get("/socket/invalidate/:id", async (req, res) => {
    let sock = map.get(req.params.id)
    if(!sock) return res.status(400).json({error: "400 BAD REQUEST", message: "Could not find socket."})
    map.delete(req.params.id)
    return res.sendStatus(204)
})

app.get("/socket/:id", async (req, res) => {
    if(!req.query.hash) return res.status(400).json({error: "400 BAD REQUEST", message: "Provide a hash to send to the client."})
    let sock =map.get(req.params.id)
    if(!sock) return res.status(400).json({error: "400 BAD REQUEST", message: "Could not find socket."})
    let urlHash;
    try {
        urlHash = await songs.findById(req.query.hash)
        if(!urlHash) throw new Error()
    } catch(_) {
        return res.status(400).json({error: "400 BAD REQUEST", message: "Could not find hash."})
    }
    map.set(req.params.id, {
        ...sock,
        object: urlHash,
        invalidate: Date.now()+20000
    })
    return res.sendStatus(204)
})
 
app.use("/", require("./api"))

console.log("Listening on port http://localhost:3000")
http_server.listen(process.env.PORT || 3000)

setInterval(() => {
    // map = new Map(map.entries().filter(e => e.invalidate > Date.now()))
}, 5000)