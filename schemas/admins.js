const mongoose = require("mongoose")

const adminsSchema = new mongoose.Schema({
   admins: [String]
}, {id: false})

module.exports = mongoose.model("admins", adminsSchema)