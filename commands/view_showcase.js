module.exports = {
    data: {
        name: "View Showcase",
        type: 3,
    },
    async execute(interaction, rest, Routes) {
        if (interaction.application_id != process.env.app_id) return;
        interaction.message = Object.values(interaction.data.resolved.messages)[0]
        try {
            let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
            await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 5,
                    data: {
                        flags: 1 << 6
                    }
                }
            })
            let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
            let req = await fetch(metadata.attachments[0].url)
            let json = await req.json()
            await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                body: {
                    content: `https://discord.com/channels/${process.env.server_id}/${interaction.message.channel_id}/${json.webhookMessage}\n-# Submission ID: ${submissionID}\n${json.showcase}`
                }
            })
        } catch (_) {
            
        }
        return;
    }
}