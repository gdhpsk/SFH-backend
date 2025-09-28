let editable = require("../editable.json")
let submissionSchema = require("../schemas/submission")

module.exports = {
    data: {
        name: "edit",
        description: "used to edit submission",
        button: true
    },
    async execute(interaction, rest, Routes) {
        if (interaction.application_id != process.env.app_id) return;
            await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 5,
                    data: {
                        flags: 1 << 6
                    }
                }
            })
        let submissionID = interaction.message.content.split("Submission ID: ")[1].split("\n")[0]
        let json = await submissionSchema.findById(submissionID)
        if (interaction.message.webhook_id) {
            let user = await rest.get(Routes.guildMember(process.env.server_id, interaction.member.user.id))
            if (!user.roles.includes("899796185966075905") && !user.roles.includes("981226306085724160") && json.userID != interaction.member.user.id) return;
        }
        try {
            let fields = json.duplicate ? editable["duplicate"] : json.menuType ? editable[json.state][json.menuType] : json.tags.includes("1412792568768495677") ? (json.state == "mashup" ? editable["event_mashup"] : editable["event_remix"]) : editable[json.state]
            let select_menu = {
                type: 3,
                custom_id: "edit_submission",
                options: []
            }
            for (const field of fields) {
                select_menu.options.push({
                    label: field,
                    value: field,
                    description: json[field]?.length > 100 ? `${json[field].slice(0,97)}...` : json[field]
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
            //console.log(_)
        }
        return;
    }
}