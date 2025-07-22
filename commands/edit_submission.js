const { generateText, getYoutubeVideoId } = require("../helper");
const submissionSchema = require("../schemas/submission")

module.exports = {
    data: {
        name: "edit_submission",
        description: "Button used to edit a submission",
        button: true
    },
    async execute(interaction, rest, Routes) {
        if (interaction.application_id != process.env.app_id) return;
        if (interaction.type == 5) {
            try {
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 6
                    }
                })
                let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
                let obj = await submissionSchema.findById(submissionID)
                let field = interaction.data.components[0].components[0].custom_id
                let value = interaction.data.components[0].components[0].value
                try {
                    if (field == "state" && !['rated', 'unrated', 'challenge'].includes(field)) return;
                    if (field == "levelID") {
                        let exists = await fetch(`https://gdbrowser.com/api/search/${value}?page=0&count=1`)
                        if (!exists.ok) {
                            return
                        }
                        let json = await exists.json()
                        let level = json[0]

                        let songID = level.officialSong ? level.songName.replaceAll(" ", "") : level.customSong
                        if (songID == "Can'tLetGo") {
                            songID = "CantLetGo"
                        }
                        if (songID == "ElectromanAdventures") {
                            songID = "Electroman"
                        }
                        obj["name"] = level.name
                        obj["author"] = level.author
                        obj["songID"] = songID
                        obj["downloads"] = level.downloads
                    }
                    if (field == "songURL") {
                        let exists = await fetch(value)
                        if (!exists.ok) {
                            return
                        }
                    }
                    if (field == "showcase") {
                        let exists = await fetch(`https://i.ytimg.com/vi/${getYoutubeVideoId(value).videoId}/mqdefault.jpg`)
                        if (!exists.ok) {
                            return
                        }
                    }
                } catch (_) {
                    return;
                }
                obj[field] = value
                await rest.patch(`${obj.webhookURL}/messages/${obj.webhookMessage}`, {
                    query: `thread_id=${obj.threadChannel}`,
                    body: {
                        content: `${generateText(obj)}\n\n-# Submission ID: ${submissionID}\n-# Status: Pending :clock2:`,
                        allowed_mentions: {
                            parse: []
                        }
                    }
                })
                let thread_msg = `${obj.duplicate ? '<:Copied:1277470308982325372>' : obj.state == 'unrated' ? '<:Unrated:1040846574521172028>' : obj.state == 'challenge' ? '<:challenge:1098482063709065286>' : obj.state == "rated" ? '<:Rated:1273186176932646912>' : obj.state == "remix" ? '<:Remix:1275641183275716744>' : obj.state == "mashup" ? '♬' : '<:MenuLoop:1228952088164438067>'} ${obj.state == "mashup" ? `${obj["songAuthor"]} - ${obj["songName"]} x ${obj["mashupAuthor"]} - ${obj["mashupName"]}` : `${obj["name"]} by ${obj["author"]}`}`
                await rest.patch(Routes.channel(obj.threadChannel), {
                    body: {
                        name: thread_msg.length > 100 ? `${thread_msg.slice(0, 97)}...` : thread_msg,
                    }
                })
                await obj.save()
                await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully edited submission!`,
                        flags: 1 << 6
                    }
                })
            } catch (_) {
                console.log(_)
            }
            return
        }
        let selected = interaction.data.values[0]
        let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
        let json = await submissionSchema.findById(submissionID)
        let value = json[selected] ?? ""
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 9,
                data: {
                    title: "Edit Submission",
                    custom_id: "edit_submission",
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    "type": 4,
                                    "custom_id": selected,
                                    "label": selected,
                                    "style": 1,
                                    "min_length": 1,
                                    "placeholder": "Value...",
                                    value,
                                    "required": true
                                }
                            ]
                        }
                    ]
                }
            }
        })
        return;
    }
}