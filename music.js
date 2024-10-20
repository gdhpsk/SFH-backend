const express = require("express")
const app = express.Router()
const songs = require("./schemas/songs")

app.get("/musiclibrary.dat", (req, res) => {
    return res.redirect("/v2/songs?format=library")
})

app.get("/musiclibrary_version.txt", (req, res) => {
    return res.redirect("/v2/songs?format=version")
})

app.get("/musiclibrary_02.dat", (req, res) => {
    return res.redirect("/v2/songs?format=library")
})

app.get("/musiclibrary_version_02.txt", (req, res) => {
    return res.redirect("/v2/songs?format=version")
})

app.get("/:id", async (req, res) => {
    let songID = req.params.id.split(".")[0]
    let song = await songs.findOne({songID, state: {$in: ["rated", "unrated", "challenge"]}}, {}).lean()
    if(!song) return res.status(404).json({error: "404 NOT FOUND", message: "Could not find the given song ID."})
    return res.redirect(`/song/${song._id}?download=true&name=${songID}`)
})

module.exports = app