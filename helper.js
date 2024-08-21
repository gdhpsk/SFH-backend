function getYoutubeVideoId(link) {
    const text = link.trim()
    let urlPattern = /https?:\/\/(?:www\.)?[\w\.-]+(?:\/[\w\.-]*)*(?:\?[\w\.\-]+=[\w\.\-]+(?:&[\w\.\-]+=[\w\.\-]+)*)?\/?/g
    let url = text.match(urlPattern)

    if (url && (url[0].includes('youtube') || url[0].includes('youtu.be'))) {
const youtubeRegExp = /http(?:s?):\/\/(?:m\.|www\.)?(?:m\.)?youtu(?:be\.com\/(?:watch\?v=|embed\/|shorts\/)|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?\=]*)?/;
        const match = text.match(youtubeRegExp)
        const fullLink = url[0]
        let videoId = null
        if (match) {
            videoId = match[1]
        }
        return { fullLink, videoId, hasExtraText: text.replace(fullLink, '').trim().length > 0 }
    } else {
        return { fullLink: null, videoId: null, hasExtraText: true }
    }
}

function unratedratedchallengeText(obj) {
    return `## ${obj["name"]} by ${obj["author"]} ${obj.state == 'unrated' ? '<:Unrated:1040846574521172028>' : obj.state == 'challenge' ? '<:challenge:1098482063709065286>' : '<:Rated:1273186176932646912>'}\n***Song:*** ${obj["songAuthor"]} - ${obj["songName"]}\n***Level ID:*** ${obj["levelID"]}\n***Song ID:*** ${obj["songID"]}\n***Song URL:*** <${obj["songURL"]}>\n***Thumbnail:*** https://i.ytimg.com/vi/${getYoutubeVideoId(obj["showcase"]).videoId}/mqdefault.jpg\n***State:*** ${obj.state}${obj.comments ? `\n***Notes:*** ${obj.comments}` : ""}`
}

function remixText(obj) {
    return `## ${obj["name"]} by ${obj["author"]} <:Remix:1275641183275716744>\n***Song:*** ${obj["remixAuthor"]} - ${obj["remixName"]}${obj["remixInfo"] ? ` ${obj["remixInfo"]}` : ""}\n***Level ID:*** ${obj["levelID"]}\n***Song ID:*** ${obj["songID"]}\n***Song URL:*** <${obj["songURL"]}>\n***Thumbnail:*** https://i.ytimg.com/vi/${getYoutubeVideoId(obj["showcase"]).videoId}/mqdefault.jpg${obj.comments ? `\n***Notes:*** ${obj.comments}` : ""}`
}

function mashupText(obj) {
    return `## ${obj["name"]} by ${obj["author"]} <:Mashup:1275630647943368724>\n***Song:*** ${obj["songAuthor"]} - ${obj["songName"]} x ${obj["mashupAuthor"]} - ${obj["mashupName"]}\n***Level ID:*** ${obj["levelID"]}\n***Song ID:*** ${obj["songID"]}\n***Song URL:*** <${obj["songURL"]}>\n***Thumbnail:*** https://i.ytimg.com/vi/${getYoutubeVideoId(obj["showcase"]).videoId}/mqdefault.jpg${obj.comments ? `\n***Notes:*** ${obj.comments}` : ""}`
}

function menuLoopText(obj) {
    return `## GD Menu Loop <:MenuLoop:1228952088164438067>\n***Song:*** ${obj.menuType == "remix" ? `GD Menu Song (${obj.remixType})` : obj.menuType == "mashup" ? `${obj.songAuthor == 'Menu Loop' ? 'GD Menu Loop' : obj.songAuthor} ${obj.songName ? `- ${obj.songName} ` : ''}x ${obj.mashupAuthor} - ${obj.mashupName}` : `${obj.songAuthor} - ${obj.songName}`}\n***Song URL:*** <${obj["songURL"]}>\n***Thumbnail:*** https://i.ytimg.com/vi/${getYoutubeVideoId(obj["showcase"]).videoId}/mqdefault.jpg${obj.menuType == "texture" ? `\n***Texture Pack:*** ${obj.texturePackCreator}\n***Texture Pack Showcase:*** <${obj.texturePackShowcase}>` : ""}${obj.comments ? `\n***Notes:*** ${obj.comments}` : ""}`
}

module.exports = {
    generateText(obj) {
        if(obj.state == "mashup") return mashupText(obj)
        if(obj.state == "remix") return remixText(obj)
        if(["unrated", "rated", "challenge"].includes(obj.state)) return unratedratedchallengeText(obj)
        if(obj.state == "loop") return menuLoopText(obj)
    },
    generateSongName(obj) {
        if(obj.state == "mashup") return `${obj["songAuthor"]} - ${obj["songName"]} x ${obj["mashupAuthor"]} - ${obj["mashupName"]}`
            if(obj.state == "remix") return `${obj["remixAuthor"]} - ${obj["remixName"]}${obj["remixInfo"] ? ` ${obj["remixInfo"]}` : ""}`
            if(["unrated", "rated", "challenge"].includes(obj.state)) return `${obj["songAuthor"]} - ${obj["songName"]}`
            if(obj.state == "loop") return `${obj.menuType == "remix" ? `GD Menu Song (${obj.remixType})` : obj.menuType == "mashup" ? `${obj.songAuthor == 'Menu Loop' ? 'GD Menu Loop' : obj.songAuthor} ${obj.songName ? `- ${obj.songName} ` : ''}x ${obj.mashupAuthor} - ${obj.mashupName}` : `${obj.songAuthor} - ${obj.songName}`}`
    },
    getYoutubeVideoId(link) {
        const text = link.trim()
        let urlPattern = /https?:\/\/(?:www\.)?[\w\.-]+(?:\/[\w\.-]*)*(?:\?[\w\.\-]+=[\w\.\-]+(?:&[\w\.\-]+=[\w\.\-]+)*)?\/?/g
        let url = text.match(urlPattern)
    
        if (url && (url[0].includes('youtube') || url[0].includes('youtu.be'))) {
    const youtubeRegExp = /http(?:s?):\/\/(?:m\.|www\.)?(?:m\.)?youtu(?:be\.com\/(?:watch\?v=|embed\/|shorts\/)|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?\=]*)?/;
            const match = text.match(youtubeRegExp)
            const fullLink = url[0]
            let videoId = null
            if (match) {
                videoId = match[1]
            }
            return { fullLink, videoId, hasExtraText: text.replace(fullLink, '').trim().length > 0 }
        } else {
            return { fullLink: null, videoId: null, hasExtraText: true }
        }
    }
}