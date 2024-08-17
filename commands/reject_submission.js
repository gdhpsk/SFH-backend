const { generateText } = require("../helper");

module.exports = {
    data: {
        name: "reject_submission",
        description: "Button used to reject a submission (mod)",
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
                        components: [],
                        content: `${generateText(json)}\n\n-# Submission ID: ${metadata.id}\n-# Status: Rejected <:Cross:943424407722930287>`
                    }
                })
                await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully rejected submission by <@${json.userID}>:\n\n${msg.content}`,
                        flags: 1 << 6
                    }
                })
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token, interaction.message_id), {
                    body: {
                        components: [],
                        content: `${generateText(json)}\n\n-# Submission ID: ${metadata.id}\n-# Status: Rejected <:Cross:943424407722930287>`
                    }
                })
                await rest.post(Routes.channelMessages(json.DMchannel), {
                    body: {
                        content: `Moderator <@${interaction.member.user.id}> has rejected this submission of yours. Reason: ${interaction.data.components[0].components[0].value}. If you have any questions, feel free to DM them.`,
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
                    custom_id: "reject_submission",
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