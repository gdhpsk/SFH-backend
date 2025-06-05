const { generateText } = require("../helper");
let submissionSchema = require("../schemas/submission")

module.exports = {
    data: {
        name: "delete",
        guild_id: process.env.server_id,
        button: true
    },
    async execute(interaction, rest, Routes) {
            await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 5,
                    data: {
                        flags: 1 << 6
                    }
                }
            })
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
        let json = await submissionSchema.findById(submissionID)
        if (!user.roles.includes("899796185966075905") && !user.roles.includes("981226306085724160") && interaction.member.user.id != json.userID) return;
        try {
            await json.deleteOne()
            await rest.delete(Routes.channel(json.threadChannel))
        } catch (_) {
        }
        return;
    }
}