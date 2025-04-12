const { generateText } = require("../helper");
let submissionSchema = require("../schemas/submission")

module.exports = {
    data: {
        name: "reject",
        guild_id: process.env.server_id,
        button: true
    },
    async execute(interaction, rest, Routes) {
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        if (!user.roles.includes("899796185966075905") && !user.roles.includes("981226306085724160")) return;
        if (interaction.type == 5) {
            try {
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 5
                    }
                })
                let submissionID = interaction.data.components[1].components[0].value
                let json = await submissionSchema.findById(submissionID)
                await rest.patch(`${json.webhookURL}/messages/${json.webhookMessage}`, {
                    query: `thread_id=${json.threadChannel}`,
                    body: {
                        components: [],
                        content: `${generateText(json)}\n\n-# Submission ID: ${json._id.toString()}\n-# Status: Rejected <:Cross:943424407722930287>`
                    }
                })
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: `<@${json.userID}>, your submission has been rejected by <@${interaction.member.user.id}>. Reason: ${interaction.data.components[0].components[0].value}. If you have any questions, feel free to DM them.`
                    }
                })
                await rest.patch(Routes.channel(json.threadChannel), {
                    body: {
                        applied_tags: [...json.tags, "1352901022426726471"],
                        locked: true,
                        archived: true
                    }
                })
                await json.deleteOne()
            } catch (_) {
                console.log(_)
            }
            return;
        }
        try {
        let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 9,
                data: {
                    title: "Submission Rejection",
                    custom_id: "reject",
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