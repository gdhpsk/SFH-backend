const { generateText, generateSongName, getYoutubeVideoId } = require("../helper");
const eventsSchema = require("../schemas/event")

module.exports = {
    data: {
        name: "edit_event",
        description: "Edit the current SFH level event",
        type: 1,
        dm_permission: true,
        options: [
                    {
                        type: 3,
                        name: "song_author",
                        description: "Author of the original song",
                        required: true
                    },
                    {
                        type: 3,
                        name: "song_name",
                        description: "Name of the original song",
                        required: true
                    },
                    {
                        type: 3,
                        name: "level_id",
                        description: "Author of the song that you're mashing the gd song up with",
                        required: true
                    }
                ]
    },
    async execute(interaction, rest, Routes) {
        if(interaction.application_id != process.env.app_id) return;
         await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 5,
                        data: {
                            flags: 1 << 6
                        }
                    }
                })
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        if (!user.roles.includes("899796185966075905") && !user.roles.includes("981226306085724160")) return;
        let getOption = (option) => interaction.data.options.find(e => e.name == option)?.value
            try {
                await eventsSchema.updateOne({}, {
                    $set: {
                        songAuthor: getOption("song_author"),
                        songName: getOption("song_name"),
                        levelID: getOption("level_id")
                    }
                })
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                body: {
                    content: `Successfully updated the event.`
                }
            })
            } catch (_) {
                console.log(_)
            }
            return;
    }
}