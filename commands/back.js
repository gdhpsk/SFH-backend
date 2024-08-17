let editable = require("../editable.json")

module.exports = {
    data: {
        name: "back",
        description: "Button used to edit a submission (user)",
        button: true
    },
    async execute(interaction, rest, Routes) {
        try {
            interaction.message.components.pop()
            interaction.message.components.pop()
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 7,
                        data: {
                            components: interaction.message.components
                        }
                    }
                })
        } catch (_) {
            console.log(_)
        }
        return;
    }
}