module.exports = {
    data: {
        name: "delete_user_submission",
        description: "Button used to delete a submission (user)",
        button: true
    },
    async execute(interaction, rest, Routes) {
        let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 6
            }
        })
        try {
            let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
            let req = await fetch(metadata.attachments[0].url)
            let json = await req.json()
            await rest.delete(Routes.channelMessage(process.env.metadata_channel, submissionID))
            await rest.delete(Routes.channelMessage(json.webhookChannel, json.webhookMessage))
            await rest.patch(Routes.channelMessage(interaction.channel_id, interaction.message.id), {
                body: {
                    components: []
                }
            })
            await rest.post(Routes.channelMessages(interaction.channel_id, interaction.message.id), {
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