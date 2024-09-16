const { generateText } = require("../helper");
const changelogSchema = require("../schemas/changelog")

module.exports = {
    data: {
        name: "Create Changelog",
        guild_id: process.env.server_id,
        type: 3
    },
    async execute(interaction, rest, Routes) {
        let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
        if (!user.roles.includes("899796185966075905")) return;
            try {
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 5,
                        data: {
                            flags: 1 << 6
                        }
                    }
                })
                let exists = await changelogSchema.exists({userID: interaction.member.user.id})
                if(exists) {
                    await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                        body: {
                            content: `You still have a valid changelog session going on!`
                        }
                    })
                }
                let entry = await changelogSchema.create({
                    userID: interaction.member.user.id,
                    createdAt: Date.now()
                })
                await changelogSchema.create({
                    userID: interaction.member.user.id,
                    id: entry._id.toString(),
                    changes: []
                })
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully created changelog session!`
                    }
                })
            } catch (_) {
            }
            return;
    }
}