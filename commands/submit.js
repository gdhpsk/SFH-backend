const { generateText, getYoutubeVideoId } = require("../helper");
const songsSchema = require("../schemas/songs")

function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

module.exports = {
    data: {
        name: "submit",
        description: "Submit songs to SFH using this command!",
        type: 1,
        dm_permission: true,
        options: [
            {
                type: 1,
                name: "mashup",
                description: "Used for submitting mashups",
                options: [
                    {
                        type: 11,
                        name: "mashup_file",
                        description: "File of the mashuped song",
                        required: true
                    },
                    {
                        type: 3,
                        name: "gdsong_author",
                        description: "Author of the original song",
                        required: true
                    },
                    {
                        type: 3,
                        name: "gdsong_name",
                        description: "Name of the original song",
                        required: true
                    },
                    {
                        type: 3,
                        name: "song_author",
                        description: "Author of the song that you're mashing the gd song up with",
                        required: true
                    },
                    {
                        type: 3,
                        name: "song_name",
                        description: "Name of the song that you're mashing the gd song up with",
                        required: true
                    },
                    {
                        type: 4,
                        name: "level_id",
                        description: "ID of the level",
                        required: true
                    },
                    {
                        type: 3,
                        name: "showcase",
                        description: "YT link for the thumbnail on the site",
                        required: true
                    },
                    {
                        type: 3,
                        name: "song_link",
                        description: "Showcase of the mashuped song",
                        required: false
                    },
                    {
                        type: 3,
                        name: "comments",
                        description: "Extra comments?",
                        required: false
                    },
                ]
            },
            {
                type: 1,
                name: "remix",
                description: "Used for submitting remixes",
                options: [
                    {
                        type: 11,
                        name: "remix_file",
                        description: "File of the remixed song",
                        required: true
                    },
                    {
                        type: 3,
                        name: "remix_author",
                        description: "Author of the remixed song",
                        required: true
                    },
                    {
                        type: 3,
                        name: "remix_name",
                        description: "Name of the remixed song",
                        required: true
                    },
                    {
                        type: 4,
                        name: "level_id",
                        description: "ID of the level",
                        required: true
                    },
                    {
                        type: 3,
                        name: "showcase",
                        description: "YT link for the thumbnail on the site",
                        required: true
                    },
                    {
                        type: 3,
                        name: "song_link",
                        description: "Showcase of the remixed song",
                        required: false
                    },
                    {
                        type: 3,
                        name: "remix_info",
                        description: 'For example, in "gdhpsk - example (8-Bit)", "(8-Bit)" is the remix info. Include proper brackets!',
                        required: false
                    },
                    {
                        type: 3,
                        name: "comments",
                        description: "Extra comments?",
                        required: false
                    }
                ]
            },
            {
                type: 1,
                name: "rated",
                description: "Used for submitting rated level NONGs",
                options: [
                    {
                        type: 11,
                        name: "rated_file",
                        description: "File of the rated NONG song",
                        required: true
                    },
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
                        name: "showcase",
                        description: "Song showcase link for the thumbnail",
                        required: true
                    },
                    {
                        type: 4,
                        name: "level_id",
                        description: "ID of the level",
                        required: true
                    },
                    {
                        type: 3,
                        name: "song_link",
                        description: "Link to the original song",
                        required: false
                    },
                    {
                        type: 3,
                        name: "comments",
                        description: "Extra comments?",
                        required: false
                    }
                ]
            },
            {
                type: 1,
                name: "unrated",
                description: "Used for submitting unrated level NONGs",
                options: [
                    {
                        type: 11,
                        name: "unrated_file",
                        description: "File of the unrated NONG song",
                        required: true
                    },
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
                        name: "showcase",
                        description: "Song showcase link",
                        required: true
                    },
                    {
                        type: 4,
                        name: "level_id",
                        description: "ID of the level",
                        required: true
                    },
                    {
                        type: 3,
                        name: "song_link",
                        description: "Link to the original song",
                        required: false
                    },
                    {
                        type: 3,
                        name: "comments",
                        description: "Extra comments?",
                        required: false
                    }
                ]
            },
            {
                type: 1,
                name: "challenge",
                description: "Used for submitting challenge level NONGs",
                options: [
                    {
                        type: 11,
                        name: "challenge_file",
                        description: "File of the challenge level NONG song",
                        required: true
                    },
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
                        name: "showcase",
                        description: "Song showcase link",
                        required: true
                    },
                    {
                        type: 4,
                        name: "level_id",
                        description: "ID of the level",
                        required: true
                    },
                    {
                        type: 3,
                        name: "song_link",
                        description: "Link to the original song",
                        required: false
                    },
                    {
                        type: 3,
                        name: "comments",
                        description: "Extra comments?",
                        required: false
                    }
                ]
            },
            {
                type: 2,
                name: "menu",
                description: "Used for submitting menu loops",
                options: [
                    {
                        type: 1,
                        name: "mashup",
                        description: "Used for submitting mashup menu loops",
                        options: [
                            {
                                type: 11,
                                name: "mashup_file",
                                description: "File of the mashuped menu loop",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_author",
                                description: "Author of the song that you're mashing the gd menu loop up with",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_name",
                                description: "Name of the song that you're mashing the gd menu loop up with",
                                required: true
                            },
                            {
                                type: 3,
                                name: "showcase",
                                description: "Thumbnail for the website",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_link",
                                description: "Link to the mashuped menu loop",
                                required: false
                            },
                            {
                                type: 3,
                                name: "gdsong_author",
                                description: "Author of the original menu loop",
                                required: false
                            },
                            {
                                type: 3,
                                name: "gdsong_name",
                                description: "Name of the original menu loop",
                                required: false
                            },
                            {
                                type: 3,
                                name: "comments",
                                description: "Extra comments?",
                                required: false
                            }
                        ]
                    },
                    {
                        type: 1,
                        name: "remix",
                        description: "Used for submitting remixes of menu loops",
                        options: [
                            {
                                type: 11,
                                name: "remix_file",
                                description: "File of the remixed menu loop",
                                required: true
                            },
                            {
                                type: 3,
                                name: "remix_type",
                                description: "Type of the remixed menu loop (i.e. 8 bit)",
                                required: true
                            },
                            {
                                type: 3,
                                name: "showcase",
                                description: "Thumbnail for the website",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_link",
                                description: "Link to the remixed menu loop",
                                required: false
                            },
                            {
                                type: 3,
                                name: "comments",
                                description: "Extra comments?",
                                required: false
                            }
                        ]
                    },
                    {
                        type: 1,
                        name: "texture",
                        description: "Used for submitting menu loops for texture packs",
                        options: [
                            {
                                type: 11,
                                name: "texture_file",
                                description: "File of the texture pack menu loop",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_author",
                                description: "Author of the original menu loops",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_name",
                                description: "Name of the original menu loops",
                                required: true
                            },
                            {
                                type: 3,
                                name: "texture_creator",
                                description: "Texture pack creator",
                                required: true
                            },
                            {
                                type: 3,
                                name: "texture_showcase",
                                description: "Texture pack showcase",
                                required: true
                            },
                            {
                                type: 3,
                                name: "showcase",
                                description: "Thumbnail for the website",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_link",
                                description: "Link to the original menu loops",
                                required: false
                            },
                            {
                                type: 3,
                                name: "comments",
                                description: "Extra comments?",
                                required: false
                            }
                        ]
                    },
                    {
                        type: 1,
                        name: "song",
                        description: "Used for submitting regular menu loops",
                        options: [
                            {
                                type: 11,
                                name: "song_file",
                                description: "File of the original menu loop",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_author",
                                description: "Author of the original menu loop",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_name",
                                description: "Name of the original menu loop",
                                required: true
                            },
                            {
                                type: 3,
                                name: "showcase",
                                description: "Thumbnail for the website",
                                required: true
                            },
                            {
                                type: 3,
                                name: "song_link",
                                description: "Link to the original menu loop",
                                required: false
                            },
                            {
                                type: 3,
                                name: "comments",
                                description: "Extra comments?",
                                required: false
                            }
                        ]
                    },
                ]
            },
        ]
    },
    async execute(interaction, rest, Routes) {
        try {
        let getOption = (option) => interaction.data.options[0].options.find(e => e.name == option)?.value
        if(interaction.data.options[0].name == "duplicate" && interaction.data.options[0].options.find(e => e.name == "song")?.focused) {
            let song = getOption("song")
            let query = await songsSchema.find({$expr: {$and: [{$regexMatch: {input: {$concat: ["$name", " (", "$songName", ")"]}, regex: new RegExp(escapeRegExp(song), 'i')}}, {$not: {$in: ["$state", ["mashup", "remix", "loop"]]}}]}}, {name: 1, songName: 1}, {limit: 25}).lean()
            await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 8,
                    data: {
                        choices: query.map(e => {
                            return {
                                name: `${e.name} (${e.songName.length > 97 - e.name.length ? `${e.songName.slice(0, 94-e.name.length)}...` : e.songName})`,
                                value: e._id.toString()
                            }
                        })
                    }
                }
            })
            return
    }
        if (interaction.data.options[0].name == "menu") {
            getOption = (option) => interaction.data.options[0].options[0].options.find(e => e.name == option)?.value
        }
        async function generateEmbed(obj, channel, text) {
            let file = await fetch(obj.songFile)
            const blob = await file.arrayBuffer()
            let metadata = await rest.post(Routes.channelMessages(process.env.metadata_channel), {
                files: [
                    {
                        name: "metadata.json",
                        contentType: "application/json",
                        data: JSON.stringify(obj)
                    }
                ]
            })
            let avatar = await fetch(interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.png` : !parseInt(interaction.member.user.discriminator) ? `https://cdn.discordapp.com/embed/avatars/${(parseInt(interaction.member.user.id) >> 22) % 6}.png` : `https://cdn.discordapp.com/embed/avatars/${parseInt(interaction.member.user.discriminator) % 5}.png`)
            let avatar_buffer = await avatar.arrayBuffer()
            try {
                await rest.patch(channel, {
                    body: {
                        name: interaction.member.user.global_name || interaction.member.user.username,
                        avatar: `data:image/png;base64,${Buffer.from(avatar_buffer).toString("base64")}`
                    }
                })
            } catch(_) {
                await rest.patch(channel, {
                    body: {
                        name: interaction.member.user.global_name || interaction.member.user.username
                    }
                })
            }
            let message = await rest.post(channel, {
                files: [
                    {
                        name: `${obj.songID}.${song.content_type == "audio/mpeg" ? "mp3" : "ogg"}`,
                        contentType: song.content_type,
                        data: Buffer.from(blob)
                    }
                ],
                body: {
                    content: `${text}\n\n-# Submission ID: ${metadata.id}\n-# Status: Pending :clock2:`,
                    allowed_mentions: {
                        parse: []
                    }
                }
            })
            await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                body: {
                    content: `Successfully submitted NONG! Check it out here: https://discord.com/channels/899784386038333551/${message.channel_id}/${message.id}. A message will be sent to you in DMs incase you want to edit / delete your submission. To view this commands, simply right click the message and click on "Apps".`
                }
            })
            try {
                let dm = await rest.post(Routes.userChannels(), {
                    body: {
                        recipient_id: interaction.member.user.id
                    }
                })
                let dm_message = await rest.post(Routes.channelMessages(dm.id), {
                    files: [
                        {
                            name: `${obj.songID}.${song.content_type == "audio/mpeg" ? "mp3" : "ogg"}`,
                            contentType: song.content_type,
                            data: Buffer.from(blob)
                        }
                    ],
                    body: {
                        content: `${text}\n\n-# Submission ID: ${metadata.id}\n-# Status: Pending :clock2:\n\n-# Note that files CANNOT be edited. If you wish to edit a file, please delete your submission.`
                    }
                })
                obj["DMchannel"] = dm.id
                obj["DMmessage"] = dm_message.id
            } catch (_) {

            }
            obj["webhookMessage"] = message.id
            obj["webhookURL"] = channel
            delete obj.songFile
            await rest.patch(Routes.channelMessage(process.env.metadata_channel, metadata.id), {
                files: [
                    {
                        name: "metadata.json",
                        contentType: "application/json",
                        data: JSON.stringify(obj)
                    }
                ]
            })
        }

        if(interaction.type == 3) return;
        await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
            body: {
                type: 5,
                data: {
                    flags: 1 << 6
                }
            }
        })
        let song = Object.values(interaction.data?.resolved?.attachments || {})?.[0]
        if (song && !["audio/mpeg", "audio/ogg"].includes(song?.content_type || "")) {
            await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                body: {
                    content: "Your song file must be either in mp3 or ogg format!"
                }
            })
            return
        }

        // song object
        let obj = {
            "songFile": song?.url,
            userID: interaction.member.user.id
        }

        let levelID = getOption("level_id")?.toString()
        let songURL = getOption("song_link")?.toString()
        if (levelID) {
            let exists = await fetch(`https://gdbrowser.com/api/search/${levelID}?page=0&count=1`)
            if (!exists.ok) {
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: "Could not find the given level ID!"
                    }
                })
                return
            }
            let json = await exists.json()
            let level = json[0]
            if(level.officialSong && !songURL) {
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: "Official songs must have a song URL attached to them!"
                    }
                })
                return
            }
            obj["name"] = level.name
            obj["author"] = level.author
            obj["songID"] = level.officialSong ? level.songName.replaceAll(" ", "") : level.customSong
            obj["levelID"] = levelID
            obj["state"] = ["Tiny", "Short"].includes(level.length) ? "challenge" : level.stars ? "rated" : "unrated"
        }
        if(songURL) {
            let exists = await fetch(songURL)
            if (!exists.ok) {
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: "Invalid song URL!"
                    }
                })
                return
            }
            obj["songURL"] = songURL
        } else {
            obj['songURL'] = `https://www.newgrounds.com/audio/listen/${obj['songID']}`
        }
        let ytVideoId = getOption("showcase")?.toString()
        if(ytVideoId) {
            let exists = await fetch(`https://i.ytimg.com/vi/${getYoutubeVideoId(ytVideoId)?.videoId}/mqdefault.jpg`)
            if (!exists.ok) {
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: "Invalid showcase link!"
                    }
                })
                return
            }
            obj["showcase"] = ytVideoId
        }

        let texture = getOption("texture_showcase")?.toString()
        if(texture) {
            let exists = await fetch(texture)
            if (!exists.ok) {
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: "Invalid texture pack showcase!"
                    }
                })
                return
            }
            obj["texturePackShowcase"] = texture
        }
        let channel = ""

        if (interaction.data.options[0].name == "duplicate") {
            let s = null
            try {
                s = await songsSchema.findById(getOption("song")).lean()
                if(!s) throw new Error()
            } catch(_) {
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: "Invalid song option! Please make sure you actually click an option rather than typing something in."
                    }
                })
                return
            }
            obj["songName"] = s.songName
            obj.songFile = `https://storage.hpsk.me/api/bucket/file/${s.urlHash}`
            obj["songURL"] = s.songURL
            obj["comments"] = getOption("comments") || ""
            obj["duplicate"] = true
            song = {
                content_type: s.filetype == "mp3" ? "audio/mpeg" : "audio/ogg"
            }
            channel = process.env.nong_channel
        }

        if (interaction.data.options[0].name == "mashup") {
            obj["songName"] = getOption("gdsong_name")
            obj["songAuthor"] = getOption("gdsong_author")
            obj["mashupName"] = getOption("song_name")
            obj["mashupAuthor"] = getOption("song_author")
            obj["comments"] = getOption("comments") || ""
            channel = process.env.mashup_channel
            obj["state"] = "mashup"
        }

        if (interaction.data.options[0].name == "remix") {
            obj["remixName"] = getOption("remix_name")
            obj["remixAuthor"] = getOption("remix_author")
            obj["remixInfo"] = getOption("remix_info")
            obj["comments"] = getOption("comments") || ""
            channel = process.env.remix_channel
            obj["state"] = "remix"
        }

        if (interaction.data.options[0].name == "unrated") {
            obj["songName"] = getOption("song_name")
            obj["songAuthor"] = getOption("song_author")
            obj["comments"] = getOption("comments") || ""
            channel = process.env.nong_channel
            obj["state"] = "unrated"
        }

        if (interaction.data.options[0].name == "rated") {
            obj["songName"] = getOption("song_name")
            obj["songAuthor"] = getOption("song_author")
            obj["comments"] = getOption("comments") || ""
            channel = process.env.nong_channel
            obj["state"] = "rated"
        }

        if (interaction.data.options[0].name == "challenge") {
            obj["songName"] = getOption("song_name")
            obj["songAuthor"] = getOption("song_author")
            obj["comments"] = getOption("comments") || ""
            channel = process.env.nong_channel
            obj["state"] = "challenge"
        }
        if (interaction.data.options[0].name == "menu") {
            obj["comments"] = getOption("comments") || ""
            channel = process.env.menu_channel
            obj["state"] = "loop"
            obj["levelID"] = process.env.levelSecret
            obj["songID"] = "menuLoop"
            switch(interaction.data.options[0].options[0].name) {
                case "mashup":
                    obj["songName"] = getOption("gdsong_name")
                    obj["songAuthor"] = getOption("gdsong_author") || "Menu Loop"
                    obj["mashupName"] = getOption("song_name")
                    obj["mashupAuthor"] = getOption("song_author")
                    obj["menuType"] = "mashup"
                break;
                case "remix":
                    obj["remixType"] = getOption("remix_type")
                    obj["menuType"] = "remix"
                break;
                case "texture":
                    obj["songName"] = getOption("song_name")
                    obj["songAuthor"] = getOption("song_author")
                    obj["texturePackCreator"] = getOption("texture_creator")
                    obj["menuType"] = "texture"
                break;
                default:
                    obj["songName"] = getOption("song_name")
                    obj["songAuthor"] = getOption("song_author")
                    obj["menuType"] = "song"
                break;
            }
        }
        await generateEmbed(obj, channel, generateText(obj))
        return
    } catch(_) {
        console.log(_)
    }
}
}