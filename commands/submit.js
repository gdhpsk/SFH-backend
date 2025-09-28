const { generateText, getYoutubeVideoId } = require("../helper");
const songsSchema = require("../schemas/songs")
const submissionSchema = require("../schemas/submission")
const eventSchema = require("../schemas/event")
const eventLimitSchema = require("../schemas/event_limit")

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
                type: 2,
                name: "event",
                description: "Used for submitting for the SFH event, see #event-info",
                options: [
                    {
                        type: 1,
                        name: "mashup",
                        description: "Used for submitting mashups for the SFH event",
                        options: [
                            {
                                type: 11,
                                name: "mashup_file",
                                description: "File of the mashuped song",
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
                description: "Used for submitting remixes for the SFH event",
                options: [
                    {
                        type: 11,
                        name: "remix_file",
                        description: "File of the remixed song",
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
            }
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
            if (interaction.data.options[0].name == "duplicate" && interaction.data.options[0].options.find(e => e.name == "song")?.focused) {
                let song = getOption("song")
                let query = await songsSchema.find({ $expr: { $and: [{ $regexMatch: { input: { $concat: ["$name", " (", "$songName", ")"] }, regex: new RegExp(escapeRegExp(song), 'i') } }, { $not: { $in: ["$state", ["mashup", "remix", "loop"]] } }] } }, { name: 1, songName: 1 }, { limit: 25 }).lean()
                await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                    body: {
                        type: 8,
                        data: {
                            choices: query.map(e => {
                                return {
                                    name: `${e.name} (${e.songName.length > 97 - e.name.length ? `${e.songName.slice(0, 94 - e.name.length)}...` : e.songName})`,
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
            if (interaction.data.options[0].name == "event") {
                const checkUserLim = await eventLimitSchema.findOne({userID: interaction.member.user.id}).lean() || {count: 0}
                const eventLimit = await eventSchema.findOne().lean()
                if(checkUserLim.count > eventLimit.maxLimit) {
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: `You've already reached the max limit of ${eventLimit.maxLimit} submission for the event!`
                    }
                })
                }
                getOption = (option) => interaction.data.options[0].options[0].options.find(e => e.name == option)?.value
            }
            async function generateEmbed(obj, channel, text, tags) {
                obj.tags = tags
                let file = await fetch(obj.songFile)
                const blob = await file.arrayBuffer()
                let metadata = await submissionSchema.create(obj)
                let avatar = await fetch(interaction.member.user.avatar ? `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.png` : !parseInt(interaction.member.user.discriminator) ? `https://cdn.discordapp.com/embed/avatars/${(parseInt(interaction.member.user.id) >> 22) % 6}.png` : `https://cdn.discordapp.com/embed/avatars/${parseInt(interaction.member.user.discriminator) % 5}.png`)
                let avatar_buffer = await avatar.arrayBuffer()
                try {
                    await rest.patch(channel, {
                        body: {
                            name: interaction.member.user.global_name || interaction.member.user.username,
                            avatar: `data:image/png;base64,${Buffer.from(avatar_buffer).toString("base64")}`
                        }
                    })
                } catch (_) {
                    await rest.patch(channel, {
                        body: {
                            name: interaction.member.user.global_name || interaction.member.user.username
                        }
                    })
                }
                let thread_msg = `${obj.duplicate ? '<:Copied:1277470308982325372>' : obj.state == 'unrated' ? '<:Unrated:1040846574521172028>' : obj.state == 'challenge' ? '<:challenge:1098482063709065286>' : obj.state == "rated" ? '<:Rated:1273186176932646912>' : obj.state == "remix" ? '<:Remix:1275641183275716744>' : obj.state == "mashup" ? '♬' : '<:MenuLoop:1228952088164438067>'} ${obj.state == "mashup" ? `${obj["songAuthor"]} - ${obj["songName"]} x ${obj["mashupAuthor"]} - ${obj["mashupName"]}` : obj.name ? `${obj["name"]} by ${obj["author"]}` : `${obj["songName"]} by ${obj["songAuthor"]}`}`
                let message = await rest.post(channel, {
                    files: [
                        {
                            name: `${obj.songID}.${song.content_type == "audio/mpeg" ? "mp3" : "ogg"}`,
                            contentType: song.content_type,
                            data: Buffer.from(blob)
                        }
                    ],
                    query: "with_components=true",
                    body: {
                        thread_name: thread_msg.length > 100 ? `${thread_msg.slice(0, 97)}...` : thread_msg,
                        content: `${text}\n\n-# Submission ID: ${metadata._id.toString()}\n-# Status: Pending :clock2:`,
                        allowed_mentions: {
                            parse: []
                        },
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        emoji: {
                                            name: "Check",
                                            id: "943424424391090256"
                                        },
                                        style: 3,
                                        custom_id: "accept"
                                    },
                                    {
                                        type: 2,
                                        emoji: {
                                            name: "Cross",
                                            id: "943424407722930287"
                                        },
                                        style: 4,
                                        custom_id: "reject"
                                    },
                                    {
                                        type: 2,
                                        emoji: {
                                            name: "✍️",
                                            id: null
                                        },
                                        style: 1,
                                        custom_id: "edit"
                                    },
                                    {
                                        type: 2,
                                        label: "Delete",
                                        style: 4,
                                        custom_id: "delete"
                                    }
                                ]
                            }
                        ]
                    }
                })
                await rest.patch(Routes.channel(message.channel_id), {
                    body: {
                        applied_tags: [...tags, "1352913222939971634"]
                    }
                })
                if (tags.includes("1412792568768495677")) {
                    await rest.put(Routes.channelMessageOwnReaction(message.channel_id, message.id, "👍"))
                    await rest.put(Routes.channelMessageOwnReaction(message.channel_id, message.id, "👎"))
                }
                await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                    body: {
                        content: `Successfully submitted NONG! Check it out here: https://discord.com/channels/899784386038333551/${message.channel_id}/${message.id}. Feel free to search for your submission in the respective forum if you want to edit it!`
                    }
                })
                obj["webhookMessage"] = message.id
                obj["threadChannel"] = message.channel_id
                obj["webhookURL"] = channel
                delete obj.songFile
                await metadata.updateOne({
                    $set: obj
                })

                if (tags.includes("1412792568768495677")) {
                await eventLimitSchema.updateOne({userID: interaction.member.user.id}, {
                    $inc: {
                        count: 1
                    }
                }, {upsert: true})
            }
            }

            if (interaction.type == 3) return;
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
            if (levelID || interaction.data.options[0].name == "event") {
                if (interaction.data.options[0].name == "event") {
                    const event = await eventSchema.findOne()
                    levelID = event.levelID
                    switch (interaction.data.options[0].options[0].name) {
                    case "mashup":  
                        obj["songName"] = event.songName
                        obj["songAuthor"] = event.songAuthor
                    break;
                    case "remix":
                        obj["remixName"] = event.songName
                        obj["remixAuthor"] = event.songAuthor
                    break;

                }
                }
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
                if (level.officialSong && !songURL) {
                    await rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
                        body: {
                            content: "Official songs must have a song URL attached to them!"
                        }
                    })
                    return
                }
                let songID = level.officialSong ? level.songName.replaceAll(" ", "") : level.customSong
                if (songID == "Can'tLetGo") {
                    songID = "CantLetGo"
                }
                if (songID == "ElectromanAdventures") {
                    songID = "Electroman"
                }
                obj["name"] = level.name
                obj["author"] = level.author
                obj["downloads"] = level.downloads
                obj["songID"] = songID
                obj["levelID"] = levelID
                obj["state"] = ["Tiny", "Short"].includes(level.length) ? "challenge" : level.stars ? "rated" : "unrated"
            }
            if (songURL) {
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
            if (ytVideoId) {
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
            if (texture) {
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
            let tag = []

            if (interaction.data.options[0].name == "duplicate") {
                let s = null
                try {
                    s = await songsSchema.findById(getOption("song")).lean()
                    if (!s) throw new Error()
                } catch (_) {
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
            channel = process.env.nong_channel

            if (interaction.data.options[0].name == "mashup") {
                obj["songName"] = getOption("gdsong_name")
                obj["songAuthor"] = getOption("gdsong_author")
                obj["mashupName"] = getOption("song_name")
                obj["mashupAuthor"] = getOption("song_author")
                obj["comments"] = getOption("comments") || ""
                obj["state"] = "mashup"
                tag = ["1352913707805704323"]
            }

            if (interaction.data.options[0].name == "event") {
                switch (interaction.data.options[0].options[0].name) {
                    case "mashup":
                        obj["mashupName"] = getOption("song_name")
                        obj["mashupAuthor"] = getOption("song_author")
                        obj["comments"] = getOption("comments") || ""
                        obj["state"] = "mashup"
                        tag = ["1352913707805704323", "1412792568768495677"]
                    break;
                    case "remix":
                        obj["remixInfo"] = getOption("remix_info")
                        obj["comments"] = getOption("comments") || ""
                        obj["state"] = "remix"
                        tag = ["1352913733545889834", "1412792568768495677"]
                    break;

                }
            }

            if (interaction.data.options[0].name == "remix") {
                obj["remixName"] = getOption("remix_name")
                obj["remixAuthor"] = getOption("remix_author")
                obj["remixInfo"] = getOption("remix_info")
                obj["comments"] = getOption("comments") || ""
                obj["state"] = "remix"
                tag = ["1352913733545889834"]
            }

            if (interaction.data.options[0].name == "unrated") {
                obj["songName"] = getOption("song_name")
                obj["songAuthor"] = getOption("song_author")
                obj["comments"] = getOption("comments") || ""
                obj["state"] = "unrated"
                tag = ["1352913618621960224"]
            }

            if (interaction.data.options[0].name == "rated") {
                obj["songName"] = getOption("song_name")
                obj["songAuthor"] = getOption("song_author")
                obj["comments"] = getOption("comments") || ""
                obj["state"] = "rated"
                tag = ["1352913599382818876"]
            }

            if (interaction.data.options[0].name == "challenge") {
                obj["songName"] = getOption("song_name")
                obj["songAuthor"] = getOption("song_author")
                obj["comments"] = getOption("comments") || ""
                obj["state"] = "challenge"
                tag = ["1352913650846928926"]
            }
            if (interaction.data.options[0].name == "menu") {
                tag = ["1352913777179234384"]
                obj["comments"] = getOption("comments") || ""
                obj["state"] = "loop"
                obj["levelID"] = process.env.levelSecret
                obj["songID"] = "menuLoop"
                switch (interaction.data.options[0].options[0].name) {
                    case "mashup":
                        tag.push("1352913707805704323")
                        obj["songName"] = getOption("gdsong_name")
                        obj["songAuthor"] = getOption("gdsong_author") || "Menu Loop"
                        obj["mashupName"] = getOption("song_name")
                        obj["mashupAuthor"] = getOption("song_author")
                        obj["menuType"] = "mashup"
                        break;
                    case "remix":
                        tag.push("1352913733545889834")
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
            await generateEmbed(obj, channel, generateText(obj), tag)
            return
        } catch (_) {
            console.log(_)
        }
    }
}