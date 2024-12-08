module.exports = {
    data: {
        name: "Notify User",
        guild_id: process.env.server_id,
        type: 3
    },
    async execute(interaction, rest, Routes) {
        if (interaction.application_id != process.env.app_id) return;
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        if (!user.roles.includes("899796185966075905") && !user.roles.includes("981226306085724160")) return;
        if (interaction.type == 5) {
            try {
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 6
                    }
                })
                let submissionID = interaction.data.components[1].components[0].value
                let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
                let req = await fetch(metadata.attachments[0].url)
                let json = await req.json()
                try {
                    await rest.post(Routes.channelMessages(json.DMchannel), {
                        body: {
                            content: interaction.data.components[0].components[0].value,
                            message_reference: {
                                message_id: json.DMmessage
                            }
                        }
                    })
                } catch(_) {
                    await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                        body: {
                            content: `Unfortunately, <@${json.userID}> does not have their DMs enabled for SFH bot. Try contacting them through the server maybe?`,
                            flags: 1 << 6
                        }
                    })
                    return;
                }
                interaction.message = await rest.get(`${json.webhookURL}/messages/${json.webhookMessage}`)
                await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully notified <@${json.userID}> about submission:\n\n${interaction.message.content}`,
                        flags: 1 << 6
                    }
                })
            } catch (_) {
            }
            return;
        }
        try {
            interaction.message = Object.values(interaction.data.resolved.messages)[0]
            let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
            await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 9,
                    data: {
                        title: "Notify user",
                        custom_id: "Notify User",
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        "type": 4,
                                        "custom_id": "notify",
                                        "label": "Message",
                                        "style": 1,
                                        "min_length": 1,
                                        "placeholder": "Message...",
                                        "required": true
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        "type": 4,
                                        "custom_id": "id",
                                        "label": "Submission ID",
                                        "style": 1,
                                        "min_length": 1,
                                        "value": submissionID,
                                        "required": true
                                    }
                                ]
                            }
                        ]
                    }
                }
            })
        } catch (_) { }
    }
}