const fs = require("fs")
const arrayBufferToWaveform = require("../waveform");
const { convertOggToMp3 } = require("../conversion");

module.exports = {
    data: {
        name: "View as Audio Message",
        type: 3,
    },
    async execute(interaction, rest, Routes) {
        if (interaction.application_id != process.env.app_id) return;
        let msg = await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 4,
                data: {
                    content: "Loading...",
                    flags:  (1 << 6) ^ (1 << 13)
                }
            }
        })
        interaction.message = Object.values(interaction.data.resolved.messages)[0]
        try {
            let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
            let metadata = await rest.get(Routes.channelMessage(process.env.metadata_channel, submissionID))
            let req1 = await fetch(metadata.attachments[0].url)
            let json = await req1.json()
            let req = await fetch(interaction.message.attachments[0].url)
            let buffer = await req.arrayBuffer()
            let {waveform, duration} = await arrayBufferToWaveform(buffer);
            let data = null
            switch(interaction.message.attachments[0].content_type) {
                case "audio/ogg":
                    data = await convertOggToMp3(Buffer.from(buffer))
                break;
                default:
                    data = Buffer.from(buffer)
                break;
            }
            await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                files: [
                    {
                        name:  `${json.songID}.mp3`,
                        contentType: "audio/mpeg",
                        data,
                    }
                ],
                body: {
                        content: `https://discord.com/channels/${process.env.server_id}/${interaction.message.channel_id}/${json.webhookMessage}\n-# Submission ID: ${submissionID}`,
                        flags:  (1 << 6) ^ (1 << 13),
                        attachments: [
                            {
                                id: "0",
                                filename:  `${json.songID}.mp3`,
                                content_type: "audio/mpeg",
                                size:  interaction.message.attachments[0].size,
                                waveform,
                                duration_secs: duration
                            }
                        ]
                }
            })
            await rest.delete(Routes.webhookMessage(interaction.application_id, interaction.token, msg.id))
        } catch (_) {
            console.log(_)
            await rest.post(Routes.webhook(interaction.application_id, interaction.token), {
                body: {
                    content: "Could not load the file successfully."
                }
            })
        }
        return;
    }
}