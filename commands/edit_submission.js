const { generateText, getYoutubeVideoId } = require("../helper");

module.exports = {
    data: {
        name: "edit_submission",
        description: "Button used to edit a submission (user)",
        button: true
    },
    async execute(interaction, rest, Routes) {
        if (interaction.message.webhook_id) {
            let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
            if (!user.roles.includes("899796185966075905")) return;
        }
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
                        await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                            body: {
                                content: "Invalid song URL!"
                            }
                        })
                        return
                    }
                }
                if (field == "showcase") {
                    let exists = await fetch(`https://i.ytimg.com/vi/${getYoutubeVideoId(value).videoId}/mqdefault.jpg`)
                    if (!exists.ok) {
                        await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                            body: {
                                content: "Invalid showcase video!"
                            }
                        })
                        return
                    }
                }
                obj[field] = value
                if(!interaction.message.webhook_id) {
                    let file = await fetch(interaction.message.attachments[0].url)
                const blob = await file.arrayBuffer()
                let webhook_user = await rest.get(Routes.channelMessage(obj["webhookChannel"], obj["webhookMessage"]))
                let avatar = await fetch(`https://cdn.discordapp.com/avatars/${webhook_user.author.id}/${webhook_user.author.avatar}.${webhook_user.author.avatar.startsWith("a_") ? "gif" : "png"}`)
                let avatar_buffer = await avatar.arrayBuffer()
                let webhook = await rest.post(Routes.channelWebhooks(obj["webhookChannel"]), {
                    body: {
                        name: webhook_user.author.username,
                        avatar: webhook_user.author.avatar ? `data:image/${webhook_user.author.avatar.startsWith("a_") ? "gif" : "png"};base64,${Buffer.from(avatar_buffer).toString("base64")}` : undefined
                    }
                })
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 6
                    }
                })
                await rest.delete(Routes.channelMessage(obj.webhookChannel, obj.webhookMessage))
                let message = await rest.post(Routes.webhook(webhook.id, webhook.token), {
                    files: [
                        {
                            name: `${obj.songID}.${interaction.message.attachments[0].content_type == "audio/mpeg" ? "mp3" : "ogg"}`,
                            contentType: interaction.message.attachments[0].content_type,
                            data: Buffer.from(blob)
                        }
                    ],
                    body: {
                        content: `${generateText(obj)}\n\n-# Submission ID: ${submissionID}\n-# Status: Pending :clock2:`,
                        components: [
                            {
                                "type": 1,
                                "components": [
                                    {
                                        "type": 2,
                                        "label": "Edit",
                                        "style": 1,
                                        "custom_id": "edit_user_submission"
                                    },
                                    {
                                        "type": 2,
                                        "label": "Notify",
                                        "style": 1,
                                        "custom_id": "notify_user"
                                    },
                                    {
                                        "type": 2,
                                        "label": "Delete",
                                        "style": 4,
                                        "custom_id": "delete_mod_submission"
                                    }
                                ]
                            },
                            {
                                "type": 1,
                                "components": [
                                    {
                                        "type": 2,
                                        "label": "Accept",
                                        "style": 1,
                                        "custom_id": "accept_submission"
                                    },
                                    {
                                        "type": 2,
                                        "label": "Reject",
                                        "style": 4,
                                        "custom_id": "reject_submission"
                                    }
                                ]
                            }
                        ]
                    }
                })
                await rest.delete(Routes.webhook(webhook.id))
                obj["webhookMessage"] = message.id
                } else {
                    await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                        body: {
                            type: 7,
                            data: {
                                content: `${generateText(obj)}\n\n-# Submission ID: ${submissionID}\n-# Status: Pending :clock2:`,
                                components: interaction.message.components.slice(0, -2)
                            }
                        }
                    })
                }
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
                        components: interaction.message.webhook_id ? undefined : interaction.message.components.slice(0, -2)
                    }
                })
                    await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                        body: {
                            content: `Successfully edited submission!`,
                            flags: 1 << 6,
                            message_reference: {
                                message_id: interaction.message.webhook_id ? obj.webhookMessage : obj.DMmessage
                            }
                        }
                    })
            } catch (_) {
                console.log(_)
            }
            return
        }
        let selected = interaction.data.values[0]
        let value = interaction.message.components.at(-2).components[0].options.find(e => e.value == selected).description
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