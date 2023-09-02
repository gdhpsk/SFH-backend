const application = require("firebase-admin/app")
const auth = require("firebase-admin/auth")

let apps = application.getApps().length
const firebase = apps ? application.getApp("server") : application.initializeApp({
    credential: application.cert({
        projectId: process.env.project_id,
        privateKey: process.env.private_key?.replaceAll("\\n", "\n")?.replaceAll("\n", "\n"),
        clientEmail: process.env.client_email
    })
  }, "server");
  
module.exports = {
    authentication: auth.getAuth(firebase)
}