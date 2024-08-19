const { generateText } = require("../helper");

module.exports = {
    data: {
        name: "Delete Submission",
        contexts: [1],
        type: 3
    },
    async execute(interaction, rest, Routes) {
        if(interaction.application_id != process.env.app_id) return;
        interaction.message = Object.values(interaction.data.resolved.messages)[0]
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 5,
                data: {
                    flags: 1 << 6
                }
            }
        })
        try {
            let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
            let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
            let req = await fetch(metadata.attachments[0].url)
            let json = await req.json()
            await rest.delete(Routes.channelMessage(process.env.metadata_channel, submissionID))
            await rest.delete(`${json.webhookURL}/messages/${json.webhookMessage}`)
            await rest.patch(Routes.channelMessage(interaction.channel_id, interaction.message.id), {
                body: {
                    content: `${generateText(json)}\n\n-# Submission ID: ${metadata.id}\n-# Status: Deleted <:Cross:943424407722930287>`,
                    components: []
                }
            })
            await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                body: {
                    content: `Successfully deleted submission!`,
                    message_reference: {
                        message_id: interaction.message.id
                    }
                }
            })
        } catch(_) {
           
        }
    }
}