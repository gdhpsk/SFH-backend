const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const app = express()

if(!process.env.MONGODB_URI) {
    dotenv.config()
}

mongoose.connect(process.env.MONGODB_URI)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.set("view engine", "ejs")
 
app.use("/", require("./api"))

console.log("Listening on port http://localhost:3000")
app.listen(process.env.PORT || 3000)