const { generateText } = require("../helper");

module.exports = {
    data: {
        name: "Reject Submission",
        guild_id: process.env.server_id,
        type: 3
    },
    async execute(interaction, rest, Routes) {
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        if (!user.roles.includes("899796185966075905") && !user.roles.includes("981226306085724160")) return;
        if (interaction.type == 5) {
            try {
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 5,
                        data: {
                            flags: 1 << 6
                        }
                    }
                })
                let submissionID = interaction.data.components[1].components[0].value
                let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
                let req = await fetch(metadata.attachments[0].url)
                let json = await req.json()
                interaction.message = await rest.get(`${json.webhookURL}/messages/${json.webhookMessage}`)
                await rest.delete(Routes.channelMessage(process.env.metadata_channel, submissionID))
                try {
                    await rest.patch(Routes.channelMessage(json.DMchannel, json.DMmessage), {
                        body: {
                            components: [],
                            content: `${generateText(json)}\n\n-# Submission ID: ${metadata.id}\n-# Status: Rejected <:Cross:943424407722930287>`
                        }
                    })
                } catch(_) {}
                let msg = await rest.patch(`${json.webhookURL}/messages/${json.webhookMessage}`, {
                    body: {
                        components: [],
                        content: `${generateText(json)}\n\n-# Submission ID: ${metadata.id}\n-# Status: Rejected <:Cross:943424407722930287>`
                    }
                })
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully rejected submission by <@${json.userID}>:\n\n${msg.content}`
                    }
                })
                try {
                    await rest.post(Routes.channelMessages(json.DMchannel), {
                        body: {
                            content: `Moderator <@${interaction.member.user.id}> has rejected this submission of yours. Reason: ${interaction.data.components[0].components[0].value}. If you have any questions, feel free to DM them.`,
                            message_reference: {
                                message_id: json.DMmessage
                            }
                        }
                    })
                } catch(_) {
                    
                }
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
                    title: "Submission Rejection",
                    custom_id: "Reject Submission",
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
    } catch(_) {}
    }
}