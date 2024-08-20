const { generateText, getYoutubeVideoId } = require("../helper");

module.exports = {
    data: {
        name: "edit_submission",
        description: "Button used to edit a submission (user)",
        button: true
    },
    async execute(interaction, rest, Routes) {
        if(interaction.application_id != process.env.app_id) return;
        if (interaction.type == 5) {
            try {
                let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
                let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
                let req = await fetch(metadata.attachments[0].url)
                let obj = await req.json()
                let field = interaction.data.components[0].components[0].custom_id
                let value = interaction.data.components[0].components[0].value
                if (field == "levelID") {
                    let exists = await fetch(`https://gdbrowser.com/api/search/${value}?page=0&count=1`)
                    if (!exists.ok) {
                        return
                    }
                    let json = await exists.json()
                    let level = json[0]
                    obj["name"] = level.name
                    obj["author"] = level.author
                    obj["songID"] = level.officialSong ? level.songName.replaceAll(" ", "") : level.customSong
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
                obj[field] = value
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 6
                    }
                })
                await rest.patch(`${obj.webhookURL}/messages/${obj.webhookMessage}`, {
                    body: {
                        content: `${generateText(obj)}\n\n-# Submission ID: ${submissionID}\n-# Status: Pending :clock2:`,
                         allowed_mentions: {
                            parse: []
                         }
                    }
                })
                await rest.patch(Routes.channelMessage(process.env.metadata_channel, submissionID), {
                    files: [
                        {
                            name: "metadata.json",
                            contentType: "application/json",
                            data: JSON.stringify(obj)
                        }
                    ]
                })
                await rest.patch(Routes.channelMessage(obj.DMchannel, obj.DMmessage), {
                    body: {
                        content: `${generateText(obj)}\n\n-# Submission ID: ${submissionID}\n-# Status: Pending :clock2:\n\n-# Note that files CANNOT be edited. If you wish to edit a file, please delete your submission.`,
                        components: []
                    }
                })
                await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully edited submission!`,
                        flags: 1 << 6
                    }
                })
            } catch (_) {
            }
            return
        }
        let selected = interaction.data.values[0]
        let value = interaction.message.components[0].components[0].options.find(e => e.value == selected).description
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