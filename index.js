const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const app = express()
const { WebSocketServer } = require("ws")
const songs = require("./schemas/songs")
const cron = require("node-cron");
const http_server = require("http").createServer(app)
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v10");
const fs = require("fs")
const nacl = require('tweetnacl');
const {MongoWatcher} = require("./watcher")
const changelogSchema = require("./schemas/changelog")
let map = new Map()
if (!process.env.MONGODB_URI) {
    dotenv.config()
}
let rest = new REST({ version: "10" }).setToken(process.env.bot_token)
process.env.keyPath ? mongoose.connect(process.env.MONGODB_URI, {
    dbName: "SFH",
    readPreference: "primaryPreferred",
    authSource: "$external",
    authMechanism: "MONGODB-X509",
    tlsCertificateKeyFile: process.env.keyPath
}) : mongoose.connect(process.env.MONGODB_URI)

// let renewSongs = async () => {
//     let everything = await songs.find({}, {levelID: 1, name: 1}).lean()
//     for(let level of everything) {
//         let req = await fetch(`https://gdbrowser.com/api/search/${level.levelID}`)
//         if(!req.ok) {
//             console.log(`Error on level ${level.name}`)
//             continue;
//         }
//         let lev = await req.json()
//         await songs.findByIdAndUpdate(level._id, {
//             $set: {
//                 levelID: lev[0].id
//             }
//         })
//         await new Promise((resolve, reject) => {
//             setTimeout(resolve, 5000)
//         })
//     }
//     console.log("done")
// }

// renewSongs()

// cron.schedule("0 0 * * *", renewSongs)

app.use(cors())
app.use(express.urlencoded({ extended: true }))

app.set("view engine", "ejs")

const PUBLIC_KEY = process.env.public_key;
const CLIENT_ID = process.env.app_id;
function verifySignature(signature, timestamp, rawBody, publicKey) {

    const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody),
        Buffer.from(signature, 'hex'),
        Buffer.from(publicKey, 'hex')
    );
    return isVerified
}

function rawBodySaver(req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}

let commands = fs.readdirSync("./commands").filter(e => e.endsWith(".js"));
let guild_cmds = {}
let global_cmds = {}
for (const file of commands) {
    let command_file = require(`./commands/${file}`)
    if(process.env.development == "true") {
        command_file.data.default_member_permissions = 8
    }
    if(command_file.data.guild_id) {
        guild_cmds[command_file.data.name] = command_file
    } else {
        global_cmds[command_file.data.name] = command_file
    }
};
app.post("/interactions", express.json({ verify: rawBodySaver }), async (req, res) => {

    // Your public key can be found on your application in the Developer Portal

    const interaction = req.body;
    // Verify the interaction's signature
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const isValidSignature = verifySignature(signature, timestamp, req.rawBody, PUBLIC_KEY);
    if (!isValidSignature) {
        return res.status(401).end('invalid request signature');
    }
    switch (interaction.type) {
        case 1: // Ping
            res.json({ type: 1 });
            break;
        default:
            let type = req.body.data.custom_id ?? req.body.data.name ?? req.body.message.interaction?.name
            if(!req.body.member && type == "Delete Submission") {
                req.body.member = {
                    user: req.body.member?.user ?? req.body.user
                }
                await global_cmds[type].execute(req.body, rest, Routes)
            } else {
            req.body.member = {
                user: req.body.member?.user ?? req.body.user
            }
            try {
                await (guild_cmds[type] || global_cmds[type]).execute(req.body, rest, Routes)
            } catch(_) {
                console.log(_)
            }
        }
            res.status(200).json({ type: 1 });
            break;
    }


});
app.use(express.json())
app.use(cookieParser())

app.get("/socket", async (req, res) => {
    let uuid = crypto.randomUUID()
    map.set(uuid, { object: "", invalidate: Date.now() + 20000 })
    return res.send(uuid)
})

app.get("/socket/poll/:id", async (req, res) => {
    let sock = map.get(req.params.id)
    if (!sock) return res.status(400).json({ error: "400 BAD REQUEST", message: "Could not find socket." })
    if (sock.invalidate - 10000 > Date.now()) return res.sendStatus(400)
    map.set(req.params.id, {
        ...sock,
        invalidate: sock.object ? 0 : Date.now() + 20000
    })
    return res.status(200).json([sock.object])
})

app.get("/socket/invalidate/:id", async (req, res) => {
    let sock = map.get(req.params.id)
    if (!sock) return res.status(400).json({ error: "400 BAD REQUEST", message: "Could not find socket." })
    map.delete(req.params.id)
    return res.sendStatus(204)
})

app.get("/socket/:id", async (req, res) => {
    if (!req.query.hash) return res.status(400).json({ error: "400 BAD REQUEST", message: "Provide a hash to send to the client." })
    let sock = map.get(req.params.id)
    if (!sock) return res.status(400).json({ error: "400 BAD REQUEST", message: "Could not find socket." })
    let urlHash;
    try {
        urlHash = await songs.findById(req.query.hash)
        if (!urlHash) throw new Error()
    } catch (_) {
        return res.status(400).json({ error: "400 BAD REQUEST", message: "Could not find hash." })
    }
    map.set(req.params.id, {
        ...sock,
        object: urlHash,
        invalidate: Date.now() + 20000
    })
    return res.sendStatus(204)
})

app.use("/music", require("./music"))
app.use("/", require("./api"))

console.log("Listening on port http://localhost:3000")
http_server.listen(process.env.PORT || 3000, '0.0.0.0');

(async () => {
    // let webhook = await rest.post(Routes.channelWebhooks("1352870773588623404"), {
    //     body: {
    //         name: "Something"
    //     }
    // })
    // console.log(webhook) 
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: Object.values(global_cmds) .filter(e => !e.data.button).map(e => e.data)
    })
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.server_id), {
        body: Object.values(guild_cmds).filter(e => !e.data.button).map(e => e.data)
    })
    console.log("Registered slash commands.");
})()

const config = {
    client: mongoose.connection, // if using mongosse, extract the client & provide it
    collectionName: "changelogs",
    pipeline: [{$match: {operationType: "delete"}}], // specify specific watch conditions
    listeners: {
      onChange: async (next) => {
        let id = next.documentKey._id.toString()
        let changelog = await changelogSchema.findOne({id})
        if(!changelog) return;
        if(!changelog?.changes?.length) {
            await changelogSchema.deleteOne({id})
            return;
        };
        let txt = `Added by <@${changelog.userID}>\n\n`
        for(const change of changelog.changes) {
            txt += `${change.title}\n`
            if(change.songName) {
                txt += `${change.songName}\n`
            }
            if(change.author) {
                txt += `Submitted by ${change.author}\n`
            }
            if(change.author || change.songName) {
                txt += "\n"
            }
        }
        let msg =await rest.post(Routes.channelMessages("900009901097631785"), {
            body: {
                content: txt
            }
        })
        await rest.post(Routes.channelMessageCrosspost("900009901097631785", msg.id))
        await changelogSchema.deleteOne({id})
      },
    },
  };
  const myWatcher = new MongoWatcher(config);
  myWatcher.watch();
setInterval(() => {
    map = new Map(map.entries().filter(e => e.invalidate > Date.now()))
}, 5000)