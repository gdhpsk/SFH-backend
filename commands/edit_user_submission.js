let editable = require("../editable.json")

module.exports = {
    data: {
        name: "edit_user_submission",
        description: "Button used to edit a submission (user)",
        button: true
    },
    async execute(interaction, rest, Routes) {
        if (interaction.message.webhook_id) {
            let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
            if (!user.roles.includes("899796185966075905")) return;
        }
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
            let fields = json.menuType ? editable[json.state][json.menuType] : editable[json.state]
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
            if (!interaction.message.webhook_id) {
                await rest.patch(Routes.channelMessage(interaction.message.channel_id, interaction.message.id), {
                    body: {
                        components: [
                            ...interaction.message.components,
                            {
                                type: 1,
                                components: [select_menu]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: "Go Back",
                                        style: 1,
                                        custom_id: "back"
                                    }
                                ]
                            }
                        ]
                    }
                })
            } else {
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token, interaction.message_id), {
                    body: {
                        components: [
                            ...interaction.message.components,
                            {
                                type: 1,
                                components: [select_menu]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: "Go Back",
                                        style: 1,
                                        custom_id: "back"
                                    }
                                ]
                            }
                        ]
                    }
                })
            }
        } catch (_) {
            console.log(_)
        }
        return;
    }
}