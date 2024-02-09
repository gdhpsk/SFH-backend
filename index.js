const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const app = express()
const {WebSocketServer} = require("ws")
const songs = require("./schemas/songs")
const http_server = require("http").createServer(app)

let server = new WebSocketServer({server: http_server})

server.on("connection", socket => {
        let uuid = crypto.randomUUID()
        socket.send(uuid)
        socket.uuid = uuid
}) 

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

app.get("/socket/:id", async (req, res) => {
    if(!req.query.hash) return res.status(400).json({error: "400 BAD REQUEST", message: "Provide a hash to send to the ws client."})
    let sock = Array.from(server.clients).find(e => e.uuid == req.params.id)
    if(!sock) return res.status(400).json({error: "400 BAD REQUEST", message: "Could not find socket."})
    let urlHash;
    try {
        urlHash = await songs.findById(req.query.hash)
        if(!urlHash) throw new Error()
    } catch(_) {
        return res.status(400).json({error: "400 BAD REQUEST", message: "Could not find hash."})
    }
    sock.send(urlHash.urlHash)
    sock.close()
    return res.sendStatus(204)
})
 
app.use("/", require("./api"))

console.log("Listening on port http://localhost:3000")
http_server.listen(process.env.PORT || 3000)