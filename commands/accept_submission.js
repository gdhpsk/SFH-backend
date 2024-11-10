const { generateText, generateSongName, getYoutubeVideoId } = require("../helper");
const changelogSchema = require("../schemas/changelog")

module.exports = {
    data: {
        name: "Accept Submission",
        guild_id: process.env.server_id,
        type: 3
    },
    async execute(interaction, rest, Routes) {
        if(interaction.application_id != process.env.app_id) return;
        interaction.message = Object.values(interaction.data.resolved.messages)[0]
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        if (!user.roles.includes("899796185966075905")) return;
            try {
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 5,
                        data: {
                            flags: 1 << 6
                        }
                    }
                })
                let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
                let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
                let req = await fetch(metadata.attachments[0].url)
                let json = await req.json()

                /// Database logic HERE:
                let obj = {
                    token: process.env.SUPER_SECRET,
                    name: json.state == "loop" ? `Menu Loop${json.menuType == "texture" ? ` (${json.texturePackCreator} TP)` : ""}` : json.name,
                    songURL: json.songURL,
                    downloadUrl: interaction.message.attachments[0].url,
                    songName: generateSongName(json),
                    ytVideoID: getYoutubeVideoId(json.showcase).videoId,
                    songID: json.songID,
                    state: json.state,
                    levelID: json.levelID,
                    filetype: interaction.message.attachments[0].content_type == "audio/mpeg" ? "mp3" : "ogg"
                }
                let request = await fetch("https://api.songfilehub.com/songs", {
                    method: "POST",
                    headers: {
                        'content-type': "application/json"
                    },
                    body: JSON.stringify(obj)
                })
                if(!request.ok) {
                    let err = await request.json()
                    await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                        body: {
                            content: err.message,
                            flags: 1 << 6
                        }
                    })
                    return;
                }
                let changeSession = await changelogSchema.exists({userID: interaction.member.user.id, id: {$exists: false}})
                if(changeSession) {
                    let obj = {
                        title: "",
                        songName: "",
                        author: ""
                    }
                    let emojis = {
                        unrated: "<:Unrated:1040846574521172028>",
                        challenge: "<:challenge:1098482063709065286>",
                        loop: "<:MenuLoop:1228952088164438067>",
                        gd: {
                            auto: "<:Auto:1040840143818469406>",
                            easy: "<:Easy:1040840315143196702>",
                            normal: "<:Normal:1040840393522155610>",
                            hard: "<:Hard:1040840442629075114>",
                            harder: "<:Harder:1040840487529107476>",
                            insane: "<:Insane:1040840553874604042>",
                            "demon-easy": "<:EasyDemon:1040840830627360859>",
                            "demon-medium": "<:MediumDemon:1040840870653599824>",
                            "demon-hard": "<:Demon:1040840639350317156>",
                            "demon-insane": "<:InsaneDemon:1040840948453757030>",
                            "demon-extreme": "<:ExtremeDemon:1040840697902809168>"
                        }
                    }
                    if(json.state == "mashup") {
                        let user = await rest.get(Routes.user(json.userID))
                        obj.author = user?.username || "unknown user"
                    }
                    if(!emojis[json.state]) {
                        let level = await fetch(`https://gdbrowser.com/api/level/${json.levelID}`)
                        if(!level.ok) {
                            emojis[json.state] = emojis.unrated
                        }
                        let level_json = await level.json()
                        emojis[json.state] = emojis.gd[level_json.partialDiff]
                    }
                    if(["mashup", "remix"].includes(json.state)) {
                        obj.songName = generateSongName(json)
                    }
                    obj.title = `${json.state == "mashup" ? `**${json.name} (Mashup)**` : json.state == "remix" ? `**${json.name} (Remix)**`: json.state == "loop" ? `**${generateSongName(json)}**` : `**${json.name}** by ${json.author}`} ${emojis[json.state]}`
                    await changelogSchema.updateOne({userID: interaction.member.user.id, id: {$exists: true}}, {
                        $push: {
                            changes: obj
                        }
                    })
                }
                await rest.delete(Routes.channelMessage(process.env.metadata_channel, submissionID))
                let msg = await rest.patch(Routes.channelMessage(json.DMchannel, json.DMmessage), {
                    body: {
                        components: [],
                        content: `${generateText(json)}\n\n-# Submission ID: ${metadata.id}\n-# Status: Accepted <:Check:943424424391090256>`
                    }
                })
                await rest.patch(`${json.webhookURL}/messages/${json.webhookMessage}`, {
                    body: {
                        components: [],
                        content: `${generateText(json)}\n\n-# Submission ID: ${metadata.id}\n-# Status: Accepted <:Check:943424424391090256>`
                    }
                })
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully accepted submission by <@${json.userID}>:\n\n${msg.content}`,
                        flags: 1 << 6
                    }
                })
                await rest.post(Routes.channelMessages(json.DMchannel), {
                    body: {
                        content: `Moderator <@${interaction.member.user.id}> has accepted this submission of yours!`,
                        message_reference: {
                            message_id: json.DMmessage
                        }
                    }
                })
            } catch (_) {
                console.log(_)
            }
            return;
    }
}