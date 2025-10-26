const { generateText, getLatestSunday } = require("../helper");
const attendenceSchema = require("../schemas/attendence")

module.exports = {
    data: {
        name: "attendance",
        description: "View how well mashup staff are performing",
        type: 1,
        dm_permission: true,
    },
    async execute(interaction, rest, Routes) {
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        if (!user.roles.includes("899796185966075905") && !user.roles.includes("981226306085724160")) return;
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 5,
                    data: {
                        flags: 1 << 6
                    }
                }
            })
        const data = await attendenceSchema.find().sort({ total: -1 }).lean()
         await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: `**__Submissions done since ${getLatestSunday().toUTCString()}:__**\n\n${data.map(e => `<@${e.userID}>: *${e.total}* (${e.accepted} accepted, ${e.rejected} rejected)`).join("\n")}`,
                        flags: 1 << 6,
                        allowed_mentions: {
                            parse: []
                        }
                    }
                })
    }
}