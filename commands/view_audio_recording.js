const fs = require("fs")
const arrayBufferToWaveform = require("../waveform")

module.exports = {
    data: {
        name: "View as Audio Message",
        type: 3,
    },
    async execute(interaction, rest, Routes) {
        if (interaction.application_id != process.env.app_id) return;
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 5,
                data: {
                    flags:  1 << 6
                }
            }
        })
        interaction.message = Object.values(interaction.data.resolved.messages)[0]
        if (interaction.message.webhook_id) {
            let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
            if (!user.roles.includes("899796185966075905")) return;
        }
        try {
            let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
            let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
            let req1 = await fetch(metadata.attachments[0].url)
            let json = await req1.json()
            let req = await fetch(interaction.message.attachments[0].url)
            let buffer = await req.arrayBuffer()
            let {waveform, duration} = await arrayBufferToWaveform(buffer);
            await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                files: [
                    {
                        name: `${json.songID}.${interaction.message.attachments[0].content_type == "audio/mpeg" ? "mp3" : "ogg"}`,
                        contentType: interaction.message.attachments[0].content_type,
                        data: Buffer.from(buffer),
                    }
                ],
                body: {
                        content: `https://discord.com/channels/${process.env.server_id}/${interaction.message.channel_id}/${json.webhookMessage}\n-# Submission ID: ${submissionID}`,
                        flags: 1 << 13,
                        attachments: [
                            {
                                id: "0",
                                filename: `${json.songID}.${interaction.message.attachments[0].content_type == "audio/mpeg" ? "mp3" : "ogg"}`,
                                contentType: interaction.message.attachments[0].content_type,
                                waveform,
                                duration_secs: duration
                            }
                        ]
                }
            })
        } catch (_) {
            
        }
        return;
    }
}