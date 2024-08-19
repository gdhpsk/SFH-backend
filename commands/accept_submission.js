const { generateText, generateSongName, getYoutubeVideoId } = require("../helper");
const songs = require("../schemas/songs");

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
                    name: json.state == "loop" ? `GD Menu Loop${json.menuType == "texture" ? ` (${json.texturePackCreator} TP)` : ""}` : json.name,
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