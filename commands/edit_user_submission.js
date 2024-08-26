let editable = require("../editable.json")

module.exports = {
    data: {
        name: "Edit Submission",
        type: 3,
    },
    async execute(interaction, rest, Routes) {
        if (interaction.application_id != process.env.app_id) return;
        interaction.message = Object.values(interaction.data.resolved.messages)[0]
        if (interaction.message.webhook_id) {
            let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
            if (!user.roles.includes("899796185966075905")) return;
        }
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
            let fields = json.duplicate ? editable["duplicate"] : json.menuType ? editable[json.state][json.menuType] : editable[json.state]
            let select_menu = {
                type: 3,
                custom_id: "edit_submission",
                options: []
            }
            for (const field of fields) {
                select_menu.options.push({
                    label: field,
                    value: field,
                    description: json[field]
                })
            }
            await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                body: {
                    content: `https://discord.com/channels/${process.env.server_id}/${interaction.message.channel_id}/${json.webhookMessage}\n-# Submission ID: ${submissionID}`,
                    components: [
                        {
                            type: 1,
                            components: [select_menu]
                        }
                    ]
                }
            })
        } catch (_) {
            
        }
        return;
    }
}