const express = require("express")
const app = express.Router()

app.get("/musiclibrary.dat", (req, res) => {
    return res.redirect("/v2/songs?format=library")
})

app.get("/musiclibrary_version.txt", (req, res) => {
    return res.redirect("/v2/songs?format=version")
})

module.exports = app