module.exports = {
    data: {
        name: "notify_user",
        description: "Button used to notify a user about a submission (mod)",
        button: true
    },
    async execute(interaction, rest, Routes) {
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        if (!user.roles.includes("899796185966075905")) return;
        if (interaction.type == 5) {
            try {
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 6
                    }
                })
                let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
                let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
                let req = await fetch(metadata.attachments[0].url)
                let json = await req.json()
                await rest.post(Routes.channelMessages(json.DMchannel), {
                    body: {
                        content: interaction.data.components[0].components[0].value,
                        message_reference: {
                            message_id: json.DMmessage
                        }
                    }
                })
                await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully notified <@${json.userID}> about submission:\n\n${interaction.message.content}`,
                        flags: 1 << 6
                    }
                })
            } catch (_) {
                console.log(_)
            }
            return;
        }
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 9,
                data: {
                    title: "Notify user",
                    custom_id: "notify_user",
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
                        }
                    ]
                }
            }
        })
    }
}