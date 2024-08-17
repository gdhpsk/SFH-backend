module.exports = {
    data: {
        name: "delete_mod_submission",
        description: "Button used to delete a submission (mod)",
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
                await rest.delete(Routes.channelMessage(process.env.metadata_channel, submissionID))
                let msg = await rest.patch(Routes.channelMessage(json.DMchannel, json.DMmessage), {
                    body: {
                        components: []
                    }
                })
                await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully deleted submission by <@${json.userID}>:\n\n${msg.content}`,
                        flags: 1 << 6
                    }
                })
                await rest.delete(Routes.webhookMessage(interaction.application_id, interaction.token))
                await rest.post(Routes.channelMessages(json.DMchannel), {
                    body: {
                        content: `Moderator <@${interaction.member.user.id}> has deleted this submission of yours. Reason: ${interaction.data.components[0].components[0].value}. If you have any questions, feel free to DM them.`,
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
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 9,
                data: {
                    title: "Submission Deletion",
                    custom_id: "delete_mod_submission",
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    "type": 4,
                                    "custom_id": "reason",
                                    "label": "Reason?",
                                    "style": 1,
                                    "min_length": 1,
                                    "placeholder": "Reasoning...",
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