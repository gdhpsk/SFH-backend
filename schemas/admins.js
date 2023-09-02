const mongoose = require("mongoose")

const adminsSchema = new mongoose.Schema({
   admins: [String]
})

module.exports = mongoose.model("admins", adminsSchema)