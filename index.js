// FUNCTION
const fs = require('fs-extra')
const { 
    lol, 
    bot_token, 
    owner, 
    version, 
    prefix 
} = JSON.parse(fs.readFileSync(`./config.json`))

const { register, premium, limit, level, afk, atm} = require('./data')
const { fetchJson, range, tanggal, kyun} = require('./lib/function')
const { msg } = require('./msg')
const help = require('./lib/help')
const tele = require('./lib/tele')
const limitCount = 25
const errorImg = 'https://i.ibb.co/yP8ZkXb/Pics-Art-02-28-08-54-47.jpg'

// MODULE
const { Telegraf } = require('telegraf')
const axios = require('axios')
const canvas = require('canvacord')
const bot = new Telegraf(bot_token)
const chalk = require('chalk')
const moment = require('moment-timezone')
const toMs = require('ms')
const cron = require('node-cron')
const os = require('os')
const ms = require('parse-ms')

// DATABASE
const _leveling = JSON.parse(fs.readFileSync('./database/group/leveling.json'))
const _nsfw = JSON.parse(fs.readFileSync('./database/group/nsfw.json'))
const _premium = JSON.parse(fs.readFileSync('./database/bot/premium.json'))
const _registered = JSON.parse(fs.readFileSync('./database/bot/registered.json'))
let _limit = JSON.parse(fs.readFileSync('./database/user/limit.json'))
const _level = JSON.parse(fs.readFileSync('./database/user/level.json'))

bot.command('start', async(zen) => {
    user = await tele.getUser(zen)
    await help.start(zen, pushname)
    await zen.deleteMessage()
})

bot.command('help', async(zen) => {
    user = await tele.getUser(zen)
    await help.help(zen, pushname)
})

bot.on("callback_query", async(zen) => {
    callback_data = zen.callbackQuery.data
    user = await tele.getUser(zen)
    const isGroup = zen.chat.type.includes("group")
    const groupName = isGroup ? zen.chat.title : ""
    if (!isGroup) console.log(chalk.whiteBright("├ "), chalk.cyanBright("[   ACT   ]"), chalk.whiteBright(callback_data), chalk.greenBright("from"), chalk.whiteBright(pushname))
    if (isGroup) console.log(chalk.whiteBright("├ "), chalk.cyanBright("[   ACT   ]"), chalk.whiteBright(callback_data), chalk.greenBright("from"), chalk.whiteBright(pushname), chalk.greenBright("in"), chalk.whiteBright(groupName))
    
    switch (callback_data) {

        case 'islami':
            await help.islami(zen)
        break
        case 'downloader':
            await help.download(zen)
        break
        case 'textpro':
            await help.textpro(zen)
        break
        case 'phoxy':
            await help.phoxy(zen)
        break
        case 'ephoto':
            await help.ephoto(zen)
        break
        case 'randimage':
            await help.randimage(zen)
        break
        case 'randtext':
            await help.randtext(zen)
        break
        case 'anime':
            await help.anime(zen)
        break
        case 'movie':
            await help.movie(zen)
        break
        case 'help':
        default:
            await help.help(zen, pushname)
        break

    }
})

bot.on("message", async(zen) => {
    try {
        const time = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        const body = zen.message.text || zen.message.caption || ""
        comm = body.trim().split(" ").shift().toLowerCase()
        cmd = false

        if (prefix != "" && body.startsWith(prefix)) {
            cmd = true
            comm = body.slice(1).trim().split(" ").shift().toLowerCase()
        }
        
        const reply = async(text) => {
            for (var x of range(0, text.length, 4096)) {
                await zen.replyWithMarkdown(text.substr(x, 4096))
            }
        }

        const command = comm
        const user = await tele.getUser(zen)
        const args = await tele.getArgs(zen)
        const ar = args.map((v) => v.toLowerCase())
        const q = args.join(' ')
        //const query = args.join(' ')
        const isCmd = cmd

        const ownerNumber = [729844936]
        const isGroup = zen.chat.type.includes("group")
        const groupName = isGroup ? zen.chat.title : ""
        const from = isGroup ? zen.message.from.id : ""
        const sender = zen.message.from.id
        pushname = user.full_name

        const isOwner = ownerNumber.includes(sender)
        const isRegistered = register.checkRegisteredUser(sender, _registered)
        const isPremium = premium.checkPremiumUser(sender, _premium)
        const isLevelingOn = isGroup ? _leveling.includes(from) : false
        const isNsfw = isGroup ? _nsfw.includes(from) : false

        const quotedMessage = zen.message.reply_to_message || {}
        const isQuotedImage = quotedMessage.photo ? true : false
        const isQuotedVideo = quotedMessage.video ? true : false
        const isQuotedSticker = quotedMessage.sticker ? true : false
        const isQuotedDocument = quotedMessage.document ? true : false
        const isQuotedAnimation = quotedMessage.animation ? true : false

        // CONSOLE LOG
        if (!isGroup && !isCmd) console.log(chalk.whiteBright("├ "), chalk.cyanBright("[ PRIVATE ]"), chalk.whiteBright(body), chalk.greenBright("from"), chalk.whiteBright(pushname))
        if (isGroup && !isCmd) console.log(chalk.whiteBright("├ "), chalk.cyanBright("[  GROUP  ]"), chalk.whiteBright(body), chalk.greenBright("from"), chalk.whiteBright(pushname), chalk.greenBright("in"), chalk.whiteBright(groupName))
        if (!isGroup && isCmd) console.log(chalk.whiteBright("├ "), chalk.cyanBright("[ COMMAND ]"), chalk.whiteBright(body), chalk.greenBright("from"), chalk.whiteBright(pushname))
        if (isGroup && isCmd) console.log(chalk.whiteBright("├ "), chalk.cyanBright("[ COMMAND ]"), chalk.whiteBright(body), chalk.greenBright("from"), chalk.whiteBright(pushname), chalk.greenBright("in"), chalk.whiteBright(groupName))

        // FUNCTION
        async function getFileID() {
            file_id = ""
            if (isQuotedImage) {
                photo = zen.message.reply_to_message.photo
                file_id = photo[photo.length - 1].file_id
            } else if (isQuotedDocument) {
                file_id = zen.message.reply_to_message.document.file_id
            } else if (isQuotedVideo) {
                file_id = zen.message.reply_to_message.video.file_id
            } else if (isQuotedAnimation) {
                file_id = zen.message.reply_to_message.animation.file_id
            }
            return file_id
        }

        premium.expiredCheck(_premium)
        cron.schedule('0 4 * * *', () => {
        const reset = []
        _limit = reset
        console.log('Resetting user limit...')
        fs.writeFileSync('./database/user/limit.json', JSON.stringify(_limit))
        console.log('Success!')
        }, {
        scheduled: true,
        timezone: 'Asia/Jakarta'
        })

        const levelRole = level.getLevelingLevel(sender, _level)
        var role = 'Warrior III'
        if (levelRole <= 5) {
            role = 'Warrior II'
        } else if (levelRole <= 10) {
            role = 'Warrior I'
        } else if (levelRole <= 15) {
            role = 'Elite III'
        } else if (levelRole <= 20) {
            role = 'Elite II'
        } else if (levelRole <= 25) {
            role = 'Elite I'
        } else if (levelRole <= 30) {
            role = 'Master III'
        } else if (levelRole <= 35) {
            role = 'Master II'
        } else if (levelRole <= 40) {
            role = 'Master I'
        } else if (levelRole <= 45) {
            role = 'GrandMaster III'
        } else if (levelRole <= 50) {
            role = 'GrandMaster II'
        } else if (levelRole <= 55) {
            role = 'GrandMaster I'
        } else if (levelRole <= 60) {
            role = 'Epic III'
        } else if (levelRole <= 65) {
            role = 'Epic II'
        } else if (levelRole <= 70) {
            role = 'Epic I'
        } else if (levelRole <= 75) {
            role = 'Legend III'
        } else if (levelRole <= 80) {
            role = 'Legend II'
        } else if (levelRole <= 85) {
            role = 'Legend I'
        } else if (levelRole <= 90) {
            role = 'Mythic'
        } else if (levelRole <= 95) {
            role = 'Mythical Glory'
        } else if (levelRole >= 100) {
            role = 'Immortal'
        } 

        switch (command) {

            // OPTIONAL
            case 'verify':
			case 'register':
			if (isRegistered) return reply('Akun kamu sudah terverfikasi')
			const namaUser = pushname
			const umurUser = '20'
			const serialUser = register.createSerial(10)

				try {
			        ppimg = await zen.telegram.getUserProfilePhotos(sender, 0, 1)
				} catch {
				    ppimg = errorImg
				}

			register.addRegisteredUser(sender, namaUser, umurUser, time, serialUser, _registered)
            await zen.replyWithPhoto(errorImg, {caption: msg.registered(namaUser, sender)})
			break

            case 'belipremium':
			case 'beliprem' :
            case 'donate' :
            reply(msg.beliPrem())
			break

            case 'help':
            case 'menu':
                user = await tele.getUser(zen)
                await help.help(zen, pushname)
            break
            
            case 'menu2':
            if (!isRegistered) return reply(msg.notRegistered())
            timer = new Date("2021-04-12").getTime();
            now = new Date().getTime();
            distance = timer - now;
            result = Math.floor(distance / (1000 * 60 * 60 * 24));
			const tgl = tanggal()
			uptimes = process.uptime()
			const uptem = kyun(uptimes)
			const jumlahUser = _registered.length
			const namaUserr = `${pushname}`
                reply(msg.menu(jumlahUser, role, namaUserr, tgl, uptem, result))
            break

            case 'rules':
            case 'lanjut':
                await reply(msg.rules())
            break

            // Islami //
            case 'listsurah':
            if (!isRegistered) return reply(msg.notRegistered())
                result = await fetchJson(`http://api.lolhuman.xyz/api/quran?apikey=${lol}`)
                result = result.result
                text = 'List Surah:\n'
                for (var x in result) {
                    text += `${x}. ${result[x]}\n`
                }
                await reply(text)
            break

            case 'alquran':
                if (args.length < 1) return reply(`Example: ${prefix + command} 18 or ${prefix + command} 18/10 or ${prefix + command} 18/1-10`)
                urls = `http://api.lolhuman.xyz/api/quran/${args[0]}?apikey=${lol}`
                quran = await fetchJson(urls)
                result = quran.result
                ayat = result.ayat
                text = `QS. ${result.surah} : 1-${ayat.length}\n\n`
                for (var x of ayat) {
                    arab = x.arab
                    nomor = x.ayat
                    latin = x.latin
                    indo = x.indonesia
                    text += `${arab}\n${nomor}. ${latin}\n${indo}\n\n`
                }
                text = text.replace(/<u>/g, "").replace(/<\/u>/g, "")
                text = text.replace(/<strong>/g, "").replace(/<\/strong>/g, "")
                text = text.replace(/<u>/g, "").replace(/<\/u>/g, "")
                await reply(text)
            break

            case 'alquranaudio':
                if (args.length == 0) return reply(`Example: ${prefix + command} 18 or ${prefix + command} 18/10`)
                surah = args[0]
                await zen.replyWithAudio({ url: `http://api.lolhuman.xyz/api/quran/audio/${surah}?apikey=${lol}` })
            break
        
            case 'asmaulhusna':
                result = await fetchJson(`http://api.lolhuman.xyz/api/asmaulhusna?apikey=${lol}`)
                result = result.result
                text = `\`No        :\` *${result.index}*\n`
                text += `\`Latin     :\` *${result.latin}*\n`
                text += `\`Arab      :\` *${result.ar}*\n`
                text += `\`Indonesia :\` *${result.id}*\n`
                text += `\`English   :\` *${result.en}*`
                await reply(text)
            break
            
            case 'kisahnabi':
                if (args.length == 0) return reply(`Example: ${prefix + command} Muhammad`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/kisahnabi/${query}?apikey=${lol}`)
                result = result.result
                text = `\`Name   :\` ${result.name}\n`
                text += `\`Lahir  :\` ${result.thn_kelahiran}\n`
                text += `\`Umur   :\` ${result.age}\n`
                text += `\`Tempat :\` ${result.place}\n`
                text += `\`Story  :\`\n${result.story}`
                await reply(text)
            break
            
            case 'jadwalsholat':
                if (args.length == 0) return reply(`Example: ${prefix + command} Yogyakarta`)
                daerah = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/sholat/${daerah}?apikey=${lol}`)
                result = result.result
                text = `\`Wilayah :\` *${result.wilayah}*\n`
                text += `\`Tanggal :\` *${result.tanggal}*\n`
                text += `\`Sahur   :\` *${result.sahur}*\n`
                text += `\`Imsak   :\` *${result.imsak}*\n`
                text += `\`Subuh   :\` *${result.subuh}*\n`
                text += `\`Terbit  :\` *${result.terbit}*\n`
                text += `\`Dhuha   :\` *${result.dhuha}*\n`
                text += `\`Dzuhur  :\` *${result.dzuhur}*\n`
                text += `\`Ashar   :\` *${result.ashar}*\n`
                text += `\`Maghrib :\` *${result.imsak}*\n`
                text += `\`Isya    :\` *${result.isya}*`
                await reply(text)
            break

                // Downloader //
            case 'ytplay':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/ytplay2?apikey=${lol}&query=${query}`)
                result = result.result
                await zen.replyWithPhoto(result.thumbnail, { caption: result.title })
                await zen.replyWithAudio({ url: result.audio[3].link })
                await zen.replyWithVideo({ url: result.video[0].link })
            break

            case 'ytsearch':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                try {
                    query = args.join(" ")
                    result = await fetchJson(`http://api.lolhuman.xyz/api/ytsearch?apikey=${lol}&query=${query}`)
                    hasil = result.result.slice(0, 3)
                    hasil.forEach(async(res) => {
                        caption = `\`❖ Title     :\` *${res.title}*\n`
                        caption += `\`❖ Link      :\`* https://www.youtube.com/watch?v=${res.videoId} *\n`
                        caption += `\`❖ Published :\` *${res.published}*\n`
                        caption += `\`❖ Views    :\` *${res.views}*\n`
                        await zen.replyWithPhoto({ url: res.thumbnail }, { caption: caption, parse_mode: "Markdown" })
                    })
                } catch (e) {
                    console.log(e)
                    help.messageError(zen)
                }
            break
            
            case 'ytmp3':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://www.youtube.com/watch?v=qZIQAk-BUEc`)
                ini_link = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/ytaudio?apikey=${lol}&url=${ini_link}`)
                result = result.result
                caption = `\`❖ Title    :\` *${result.title}*\n`
                caption += `\`❖ Uploader :\` *${result.uploader}*\n`
                caption += `\`❖ Duration :\` *${result.duration}*\n`
                caption += `\`❖ View     :\` *${result.view}*\n`
                caption += `\`❖ Like     :\` *${result.like}*\n`
                caption += `\`❖ Dislike  :\` *${result.dislike}*\n`
                caption += `\`❖ Size     :\` *${result.link[3].size}*`
                await zen.replyWithPhoto({ url: result.thumbnail }, { caption: caption, parse_mode: "Markdown" })
                if (Number(result.link[3].size.split(` MB`)[0]) >= 50.00) return reply(`Sorry the bot cannot send more than 50 MB!`)
                await zen.replyWithAudio({ url: result.link[3].link }, { title: result.title, thumb: result.thumbnail })
            break
            
            case 'ytmp4':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://www.youtube.com/watch?v=qZIQAk-BUEc`)
                ini_link = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/ytvideo?apikey=${lol}&url=${ini_link}`)
                result = result.result
                caption = `\`❖ Title    :\` *${result.title}*\n`
                caption += `\`❖ Uploader :\` *${result.uploader}*\n`
                caption += `\`❖ Duration :\` *${result.duration}*\n`
                caption += `\`❖ View     :\` *${result.view}*\n`
                caption += `\`❖ Like     :\` *${result.like}*\n`
                caption += `\`❖ Dislike  :\` *${result.dislike}*\n`
                caption += `\`❖ Size     :\` *${result.link[3].size}*`
                await zen.replyWithPhoto({ url: result.thumbnail }, { caption: caption, parse_mode: "Markdown" })
                if (Number(result.link[0].size.split(` MB`)[0]) >= 50.00) return reply(`Sorry the bot cannot send more than 50 MB!`)
                await zen.replyWithVideo({ url: result.link[0].link }, { thumb: result.thumbnail })
            break
            
            case 'tiktoknowm':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://vt.tiktok.com/ZSwWCk5o/`)
                url = args[0]
                url = `http://api.lolhuman.xyz/api/tiktok?apikey=${lol}&url=${url}`
                result = await fetchJson(url)
                await zen.replyWithVideo({ url: result.result.link })
            break
            
            case 'tiktokmusic':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://vt.tiktok.com/ZSwWCk5o/`)
                ini_link = args[0]
                await zen.replyWithAudio({ url: `http://api.lolhuman.xyz/api/tiktokmusic?apikey=${lol}&url=${ini_link}` })
            break
            
            case 'spotify':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://open.spotify.com/track/0ZEYRVISCaqz5yamWZWzaA`)
                url = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/spotify?apikey=${lol}&url=${url}`)
                result = result.result
                caption = `\`❖ Title      :\` *${result.title}*\n`
                caption += `\`❖ Artists    :\` *${result.artists}*\n`
                caption += `\`❖ Duration   :\` *${result.duration}*\n`
                caption += `\`❖ Popularity :\` *${result.popularity}*`
                await zen.replyWithPhoto({ url: result.thumbnail }, { caption: caption, parse_mode: "Markdown" })
                await zen.replyWithAudio({ url: result.link }, { title: result.title, thumb: result.thumbnail })
            break
            
            case 'spotifysearch':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                try {
                    query = args.join(" ")
                    result = await fetchJson(`http://api.lolhuman.xyz/api/spotifysearch?apikey=${lol}&query=${query}`)
                    hasil = result.result.slice(0, 3)
                    hasil.forEach(async(res) => {
                        caption = `\`❖ Title     :\` *${res.title}*\n`
                        caption += `\`❖ Artists   :\` *${res.artists}*\n`
                        caption += `\`❖ Link      :\`* ${res.link} *\n`
                        caption += `\`❖ Duration  :\` *${res.duration}*\n`
                        await reply(caption)
                    })
                } catch (e) {
                    help.messageError(zen)
                }
            break
            
            case 'jooxplay':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/jooxplay?apikey=${lol}&query=${query}`)
                result = result.result
                caption = `\`❖ Title    :\` *${result.info.song}*\n`
                caption += `\`❖ Artists  :\` *${result.info.singer}*\n`
                caption += `\`❖ Duration :\` *${result.info.duration}*\n`
                caption += `\`❖ Album    :\` *${result.info.album}*\n`
                caption += `\`❖ Uploaded :\` *${result.info.date}*\n`
                caption += `\`❖ Lirik    :\`\n ${result.lirik}`
                await zen.replyWithPhoto({ url: result.image }, { caption: caption, parse_mode: "Markdown" })
                await zen.replyWithAudio({ url: result.link[0].link }, { title: result.info.song, thumb: result.image })
            break
            
            case 'zippyshare':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://www51.zippyshare.com/v/5W0TOBz1/file.html`)
                url = args[0]
                url = await fetchJson(`http://api.lolhuman.xyz/api/zippyshare?apikey=${lol}&url=${url}`)
                url = url.result
                text = `\`❖ File Name    :\` *${url.name_file}*\n`
                text += `\`❖ Size         :\` *${url.size}*\n`
                text += `\`❖ Date Upload  :\` *${url.date_upload}*\n`
                text += `\`❖ Download Url :\` *${url.download_url}*`
                await reply(text)
            break
            
            case 'pinterest':
            case 'pin':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} zeni kawaii`)
                query = args.join(" ")
                url = await fetchJson(`http://api.lolhuman.xyz/api/pinterest?apikey=${lol}&query=${query}`)
                url = url.result
                await zen.replyWithPhoto({ url: url })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'pinterestdl':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://id.pinterest.com/pin/696580267364426905/`)
                url = args[0]
                url = await fetchJson(`http://api.lolhuman.xyz/api/pinterestdl?apikey=${lol}&url=${url}`)
                url = url.result["736x"]
                await zen.replyWithPhoto({ url: url })
                break
            case 'pixiv':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} zeni kawaii`)
                query = args.join(" ")
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/pixiv?apikey=${lol}&query=${query}` })
            break
            
            case 'pixivdl':
                if (!isPremium) return reply(msg.notPremium())
                if (args.length == 0) return reply(`Example: ${prefix + command} 63456028`)
                pixivid = args[0]
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/pixivdl/${pixivid}?apikey=${lol}` })
            break

            // AniManga //
            case 'character':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} Miku Nakano`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/character?apikey=${lol}&query=${query}`)
                result = result.result
                text = `Id : ${result.id}\n`
                text += `Name : ${result.name.full}\n`
                text += `Native : ${result.name.native}\n`
                text += `Favorites : ${result.favourites}\n`
                text += `Media : \n`
                ini_media = result.media.nodes
                for (var x of ini_media) {
                    text += `- ${x.title.romaji} (${x.title.native})\n`
                }
                text += `\nDescription : \n${result.description.replace(/__/g, "_")}`
                await zen.replyWithPhoto({ url: result.image.large }, { caption: text })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'manga':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/manga?apikey=${lol}&query=${query}`)
                result = result.result
                text = `Id : ${result.id}\n`
                text += `Id MAL : ${result.idMal}\n`
                text += `Title : ${result.title.romaji}\n`
                text += `English : ${result.title.english}\n`
                text += `Native : ${result.title.native}\n`
                text += `Format : ${result.format}\n`
                text += `Chapters : ${result.chapters}\n`
                text += `Volume : ${result.volumes}\n`
                text += `Status : ${result.status}\n`
                text += `Source : ${result.source}\n`
                text += `Start Date : ${result.startDate.day} - ${result.startDate.month} - ${result.startDate.year}\n`
                text += `End Date : ${result.endDate.day} - ${result.endDate.month} - ${result.endDate.year}\n`
                text += `Genre : ${result.genres.join(", ")}\n`
                text += `Synonyms : ${result.synonyms.join(", ")}\n`
                text += `Score : ${result.averageScore}%\n`
                text += `Characters : \n`
                ini_character = result.characters.nodes
                for (var x of ini_character) {
                    text += `- ${x.name.full} (${x.name.native})\n`
                }
                text += `\nDescription : ${result.description}`
                await zen.replyWithPhoto({ url: result.coverImage.large }, { caption: text })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'anime':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/anime?apikey=${lol}&query=${query}`)
                result = result.result
                text = `Id : ${result.id}\n`
                text += `Id MAL : ${result.idMal}\n`
                text += `Title : ${result.title.romaji}\n`
                text += `English : ${result.title.english}\n`
                text += `Native : ${result.title.native}\n`
                text += `Format : ${result.format}\n`
                text += `Episodes : ${result.episodes}\n`
                text += `Duration : ${result.duration} mins.\n`
                text += `Status : ${result.status}\n`
                text += `Season : ${result.season}\n`
                text += `Season Year : ${result.seasonYear}\n`
                text += `Source : ${result.source}\n`
                text += `Start Date : ${result.startDate.day} - ${result.startDate.month} - ${result.startDate.year}\n`
                text += `End Date : ${result.endDate.day} - ${result.endDate.month} - ${result.endDate.year}\n`
                text += `Genre : ${result.genres.join(", ")}\n`
                text += `Synonyms : ${result.synonyms.join(", ")}\n`
                text += `Score : ${result.averageScore}%\n`
                text += `Characters : \n`
                ini_character = result.characters.nodes
                for (var x of ini_character) {
                    text += `- ${x.name.full} (${x.name.native})\n`
                }
                text += `\nDescription : ${result.description}`
                await zen.replyWithPhoto({ url: result.coverImage.large }, { caption: text })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'wait':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (isQuotedImage || isQuotedAnimation || isQuotedVideo || isQuotedDocument) {
                    file_id = await getFileID()
                    url_file = await tele.getLink(file_id)
                    result = await fetchJson(`http://api.lolhuman.xyz/api/wait?apikey=${lol}&img=${url_file}`)
                    result = result.result
                    text = `Anilist id : ${result.anilist_id}\n`
                    text += `MAL id : ${result.mal_id}\n`
                    text += `Title Romaji : ${result.title_romaji}\n`
                    text += `Title Native : ${result.title_native}\n`
                    text += `Title English : ${result.title_english}\n`
                    text += `At : ${result.at}\n`
                    text += `Episode : ${result.episode}\n`
                    text += `Similarity : ${result.similarity}`
                    await zen.replyWithVideo({ url: result.video }, { caption: text })
                    limit.addLimit(sender, _limit, isPremium, isOwner)
                } else {
                    reply(`Tag gambar yang sudah dikirim`)
                }
            break
            
            case 'kusonime':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://kusonime.com/nanatsu-no-taizai-bd-batch-subtitle-indonesia/`)
                ini_url = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/kusonime?apikey=${lol}&url=${ini_url}`)
                result = result.result
                text = `Title : ${result.title}\n`
                text += `Japanese : ${result.japanese}\n`
                text += `Genre : ${result.genre}\n`
                text += `Seasons : ${result.seasons}\n`
                text += `Producers : ${result.producers}\n`
                text += `Type : ${result.type}\n`
                text += `Status : ${result.status}\n`
                text += `Total Episode : ${result.total_episode}\n`
                text += `Score : ${result.score}\n`
                text += `Duration : ${result.duration}\n`
                text += `Released On : ${result.released_on}\n`
                text += `Desc : ${result.desc}\n`
                link_dl = result.link_dl
                for (var x in link_dl) {
                    text += `\n${x}\n`
                    for (var y in link_dl[x]) {
                        text += `${y} - ${link_dl[x][y]}\n`
                    }
                }
                await zen.replyWithPhoto({ url: result.thumbnail }, { caption: text })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'kusonimesearch':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/kusonimesearch?apikey=${lol}&query=${query}`)
                result = result.result
                text = `Title : ${result.title}\n`
                text += `Japanese : ${result.japanese}\n`
                text += `Genre : ${result.genre}\n`
                text += `Seasons : ${result.seasons}\n`
                text += `Producers : ${result.producers}\n`
                text += `Type : ${result.type}\n`
                text += `Status : ${result.status}\n`
                text += `Total Episode : ${result.total_episode}\n`
                text += `Score : ${result.score}\n`
                text += `Duration : ${result.duration}\n`
                text += `Released On : ${result.released_on}\n`
                text += `Desc : ${result.desc}\n`
                link_dl = result.link_dl
                for (var x in link_dl) {
                    text += `\n${x}\n`
                    for (var y in link_dl[x]) {
                        text += `${y} - ${link_dl[x][y]}\n`
                    }
                }
                await zen.replyWithPhoto({ url: result.thumbnail }, { caption: text })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'otakudesu':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://otakudesu.tv/lengkap/pslcns-sub-indo/`)
                ini_url = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/otakudesu?apikey=${lol}&url=${ini_url}`)
                result = result.result
                text = `Title : ${result.title}\n`
                text += `Japanese : ${result.japanese}\n`
                text += `Judul : ${result.judul}\n`
                text += `Type : ${result.type}\n`
                text += `Episode : ${result.episodes}\n`
                text += `Aired : ${result.aired}\n`
                text += `Producers : ${result.producers}\n`
                text += `Genre : ${result.genres}\n`
                text += `Duration : ${result.duration}\n`
                text += `Studios : ${result.status}\n`
                text += `Rating : ${result.rating}\n`
                text += `Credit : ${result.credit}\n`
                get_link = result.link_dl
                for (var x in get_link) {
                    text += `\n\n*${get_link[x].title}*\n`
                    for (var y in get_link[x].link_dl) {
                        ini_info = get_link[x].link_dl[y]
                        text += `\n\`\`\`Reso : \`\`\`${ini_info.reso}\n`
                        text += `\`\`\`Size : \`\`\`${ini_info.size}\n`
                        text += `\`\`\`Link : \`\`\`\n`
                        down_link = ini_info.link_dl
                        for (var z in down_link) {
                            text += `${z} - ${down_link[z]}\n`
                        }
                    }
                }
                await reply(text)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'otakudesusearch':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/otakudesusearch?apikey=${lol}&query=${query}`)
                result = result.result
                text = `Title : ${result.title}\n`
                text += `Japanese : ${result.japanese}\n`
                text += `Judul : ${result.judul}\n`
                text += `Type : ${result.type}\n`
                text += `Episode : ${result.episodes}\n`
                text += `Aired : ${result.aired}\n`
                text += `Producers : ${result.producers}\n`
                text += `Genre : ${result.genres}\n`
                text += `Duration : ${result.duration}\n`
                text += `Studios : ${result.status}\n`
                text += `Rating : ${result.rating}\n`
                text += `Credit : ${result.credit}\n`
                get_link = result.link_dl
                for (var x in get_link) {
                    text += `\n\n*${get_link[x].title}*\n`
                    for (var y in get_link[x].link_dl) {
                        ini_info = get_link[x].link_dl[y]
                        text += `\n\`\`\`Reso : \`\`\`${ini_info.reso}\n`
                        text += `\`\`\`Size : \`\`\`${ini_info.size}\n`
                        text += `\`\`\`Link : \`\`\`\n`
                        down_link = ini_info.link_dl
                        for (var z in down_link) {
                            text += `${z} - ${down_link[z]}\n`
                        }
                    }
                }
                await reply(text)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break

            // Movie & Story
            case 'lk21':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} Transformer`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/lk21?apikey=${lol}&query=${query}`)
                result = result.result
                text = `Title : ${result.title}\n`
                text += `Link : ${result.link}\n`
                text += `Genre : ${result.genre}\n`
                text += `Views : ${result.views}\n`
                text += `Duration : ${result.duration}\n`
                text += `Tahun : ${result.tahun}\n`
                text += `Rating : ${result.rating}\n`
                text += `Desc : ${result.desc}\n`
                text += `Actors : ${result.actors.join(", ")}\n`
                text += `Location : ${result.location}\n`
                text += `Date Release : ${result.date_release}\n`
                text += `Language : ${result.language}\n`
                text += `Link Download : ${result.link_dl}`
                await zen.replyWithPhoto({ url: result.thumbnail }, { caption: text })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'drakorongoing':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                result = await fetchJson(`http://api.lolhuman.xyz/api/drakorongoing?apikey=${lol}`)
                result = result.result
                text = "Ongoing Drakor\n\n"
                for (var x of result) {
                    text += `Title : ${x.title}\n`
                    text += `Link : ${x.link}\n`
                    text += `Thumbnail : ${x.thumbnail}\n`
                    text += `Year : ${x.category}\n`
                    text += `Total Episode : ${x.total_episode}\n`
                    text += `Genre : ${x.genre.join(", ")}\n\n`
                }
                await reply(text)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'wattpad':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} https://www.wattpad.com/707367860-kumpulan-quote-tere-liye-tere-liye-quote-quote`)
                ini_url = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/wattpad?apikey=${lol}&url=${ini_url}`)
                result = result.result
                text = `Title : ${result.title}\n`
                text += `Rating : ${result.rating}\n`
                text += `Motify date : ${result.modifyDate}\n`
                text += `Create date: ${result.createDate}\n`
                text += `Word : ${result.word}\n`
                text += `Comment : ${result.comment}\n`
                text += `Vote : ${result.vote}\n`
                text += `Reader : ${result.reader}\n`
                text += `Pages : ${result.pages}\n`
                text += `Description : ${result.desc}\n\n`
                text += `Story : \n${result.story}`
                await zen.replyWithPhoto({ url: result.photo }, { caption: text })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'wattpadsearch':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} Tere Liye`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/wattpadsearch?apikey=${lol}&query=${query}`)
                result = result.result
                text = "Wattpad Seach : \n"
                for (var x of result) {
                    text += `Title : ${x.title}\n`
                    text += `Url : ${x.url}\n`
                    text += `Part : ${x.parts}\n`
                    text += `Motify date : ${x.modifyDate}\n`
                    text += `Create date: ${x.createDate}\n`
                    text += `Coment count: ${x.commentCount}\n\n`
                }
                await reply(text)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'cerpen':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                result = await fetchJson(`http://api.lolhuman.xyz/api/cerpen?apikey=${lol}`)
                result = result.result
                text = `Title : ${result.title}\n`
                text += `Creator : ${result.creator}\n`
                text += `Story :\n${result.cerpen}`
                await reply(text)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'ceritahoror':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                result = await fetchJson(`http://api.lolhuman.xyz/api/ceritahoror?apikey=${lol}`)
                result = result.result
                text = `Title : ${result.title}\n`
                text += `Desc : ${result.desc}\n`
                text += `Story :\n${result.story}\n`
                await zen.replyWithPhoto({ url: result.thumbnail }, { caption: text })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break

            // Random Text //
            case 'quotes':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                quotes = await fetchJson(`http://api.lolhuman.xyz/api/random/quotes?apikey=${lol}`)
                quotes = quotes.result
                author = quotes.by
                quotes = quotes.quote
                await reply(`_${quotes}_\n\n*― ${author}*`)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'quotesanime':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                quotes = await fetchJson(`http://api.lolhuman.xyz/api/random/quotesnime?apikey=${lol}`)
                quotes = quotes.result
                quote = quotes.quote
                char = quotes.character
                anime = quotes.anime
                episode = quotes.episode
                await reply(`_${quote}_\n\n*― ${char}*\n*― ${anime} ${episode}*`)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'quotesdilan':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                quotedilan = await fetchJson(`http://api.lolhuman.xyz/api/quotes/dilan?apikey=${lol}`)
                await reply(quotedilan.result)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'quotesimage':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/random/${command}?apikey=${lol}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'faktaunik':
            case 'katabijak':
            case 'pantun':
            case 'bucin':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                result = await fetchJson(`http://api.lolhuman.xyz/api/random/${command}?apikey=${lol}`)
                await reply(result.result)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'randomnama':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                result = await fetchJson(`http://api.lolhuman.xyz/api/random/nama?apikey=${lol}`)
                await reply(result.result)
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break

            // Random Image //
            case 'art':
            case 'bts':
            case 'exo':
            case 'elf':
            case 'zeni':
            case 'neko':
            case 'waifu':
            case 'shota':
            case 'husbu':
            case 'sagiri':
            case 'shinobu':
            case 'megumin':
            case 'wallnime':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/random/${command}?apikey=${lol}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'chiisaihentai':
            case 'trap':
            case 'blowjob':
            case 'yaoi':
            case 'ecchi':
            case 'hentai':
            case 'ahegao':
            case 'hozenewd':
            case 'sideoppai':
            case 'animefeets':
            case 'animebooty':
            case 'animethighss':
            case 'hentaiparadise':
            case 'animearmpits':
            case 'hentaifemdom':
            case 'lewdanimegirls':
            case 'biganimetiddies':
            case 'animebellybutton':
            case 'hentai4everyone':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/random/nsfw/${command}?apikey=${lol}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'bj':
            case 'ero':
            case 'cum':
            case 'feet':
            case 'yuri':
            case 'trap':
            case 'lewd':
            case 'feed':
            case 'eron':
            case 'solo':
            case 'gasm':
            case 'poke':
            case 'anal':
            case 'holo':
            case 'tits':
            case 'kuni':
            case 'kiss':
            case 'erok':
            case 'smug':
            case 'baka':
            case 'solog':
            case 'feetg':
            case 'lewdk':
            case 'waifu':
            case 'pussy':
            case 'femdom':
            case 'cuddle':
            case 'hentai':
            case 'eroyuri':
            case 'cum_jpg':
            case 'blowjob':
            case 'erofeet':
            case 'holoero':
            case 'classic':
            case 'erokemo':
            case 'fox_girl':
            case 'futanari':
            case 'lewdkemo':
            case 'wallpaper':
            case 'pussy_jpg':
            case 'kemonomimi':
            case 'nsfw_avatar':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/random2/${command}?apikey=${lol}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'loli':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                await zen.replyWithPhoto({ url: `https://lolhuman.herokuapp.com/api/random/nsfw/loli?apikey=${lol}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break

            // Textprome //
            case 'blackpink':
            case 'neon':
            case 'greenneon':
            case 'advanceglow':
            case 'futureneon':
            case 'sandwriting':
            case 'sandsummer':
            case 'sandengraved':
            case 'metaldark':
            case 'neonlight':
            case 'holographic':
            case 'text1917':
            case 'minion':
            case 'deluxesilver':
            case 'newyearcard':
            case 'bloodfrosted':
            case 'halloween':
            case 'jokerlogo':
            case 'fireworksparkle':
            case 'natureleaves':
            case 'bokeh':
            case 'toxic':
            case 'strawberry':
            case 'box3d':
            case 'roadwarning':
            case 'breakwall':
            case 'icecold':
            case 'luxury':
            case 'cloud':
            case 'summersand':
            case 'horrorblood':
            case 'thunder':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} zen uwu`)
                text = args.join(" ")
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/textprome/${command}?apikey=${lol}&text=${text}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'pornhub':
            case 'glitch':
            case 'avenger':
            case 'space':
            case 'ninjalogo':
            case 'marvelstudio':
            case 'lionlogo':
            case 'wolflogo':
            case 'steel3d':
            case 'wallgravity':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} zen uwu`)
                txt1 = args[0]
                txt2 = args[1]
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/textprome2/${command}?apikey=${lol}&text1=${txt1}&text2=${txt2}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break

            // Photo Oxy //
            case 'shadow':
            case 'cup':
            case 'cup1':
            case 'romance':
            case 'smoke':
            case 'burnpaper':
            case 'lovemessage':
            case 'undergrass':
            case 'love':
            case 'coffe':
            case 'woodheart':
            case 'woodenboard':
            case 'summer3d':
            case 'wolfmetal':
            case 'nature3d':
            case 'underwater':
            case 'golderrose':
            case 'summernature':
            case 'letterleaves':
            case 'glowingneon':
            case 'fallleaves':
            case 'flamming':
            case 'harrypotter':
            case 'carvedwood':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} zen uwu`)
                text = args.join(" ")
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/photooxy1/${command}?apikey=${lol}&text=${text}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
            
            case 'tiktok':
            case 'arcade8bit':
            case 'battlefield4':
            case 'pubg':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} zen uwu`)
                txt1 = args[0]
                txt2 = args[1]
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/photooxy2/${command}?apikey=${lol}&text1=${txt1}&text2=${txt2}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break

            // Ephoto 360 //
            case 'wetglass':
            case 'multicolor3d':
            case 'watercolor':
            case 'luxurygold':
            case 'galaxywallpaper':
            case 'lighttext':
            case 'beautifulflower':
            case 'puppycute':
            case 'royaltext':
            case 'heartshaped':
            case 'birthdaycake':
            case 'galaxystyle':
            case 'hologram3d':
            case 'greenneon':
            case 'glossychrome':
            case 'greenbush':
            case 'metallogo':
            case 'noeltext':
            case 'glittergold':
            case 'textcake':
            case 'starsnight':
            case 'wooden3d':
            case 'textbyname':
            case 'writegalacy':
            case 'galaxybat':
            case 'snow3d':
            case 'birthdayday':
            case 'goldplaybutton':
            case 'silverplaybutton':
            case 'freefire':
                if (!isRegistered) return reply(msg.notRegistered())
			    if (!isGroup) return reply(msg.groupOnly())
                if (limit.isLimit(sender, _limit, limitCount, isPremium, isOwner)) return reply(msg.limit())
                if (args.length == 0) return reply(`Example: ${prefix + command} zen uwu`)
                text = args.join(" ")
                await zen.replyWithPhoto({ url: `http://api.lolhuman.xyz/api/ephoto1/${command}?apikey=${lol}&text=${text}` })
                limit.addLimit(sender, _limit, isPremium, isOwner)
            break
                
            // PLAYER
            case 'profile':
            case 'me':
            if (!isRegistered) return reply(msg.notRegistered())
			if (!isGroup) return reply(msg.groupOnly())
                const username = pushname
                const namer = zen.message.from.username
                const namek = zen.message.from.id
                //const adm = isGroupAdmins ? 'Yes' : 'No'
                cekExp = ms(premium.getPremiumExpired(sender, _premium) - Date.now())
                const premi = isPremium ? `-${cekExp.days} Days` : 'No'
                const levelMe = level.getLevelingLevel(sender, _level)
                const xpMe = level.getLevelingXp(sender, _level)
                const req = 10 * Math.pow(levelMe, 2) + 50 * levelMe + 100
                //const kantongs = atm.checkATMuser(sender, _uang)
                const limitnya = isPremium || isOwner ? 'Unlimited' : `${limit.getLimit(sender, _limit, limitCount)}`
                try {
                    profilePic = await zen.telegram.getUserProfilePhotos(sender)
                    } catch {
                    profilePic = errorImg
                    }
                await zen.replyWithPhoto(errorImg, {caption: msg.profile(username, namer, namek, premi, levelMe, req, xpMe, limitnya)})
            break

            case 'level':
			if (!isRegistered) return reply(msg.notRegistered())
			if (!isGroup) return reply(msg.groupOnly())
                const userLevel = level.getLevelingLevel(sender, _level)
                const userXp = level.getLevelingXp(sender, _level)
                try {
					profilePic = await zen.telegram.getUserProfilePhotos(sender)
					} catch {
					profilePic = errorImg
					}
                const requiredXp = 10 * Math.pow(userLevel, 2) + 50 * userLevel + 100
                var str = sender
                var shorter = String(str).substr(5, 9);
                const rank = new canvas.Rank()
                .setAvatar(errorImg)
                    .setLevel(userLevel)
                    .setLevelColor('#ffffff', '#5ebdd8')
                    .setRank(Number(level.getUserRank(sender, _level)))
                    .setRankColor('#ffffff', '#5ebdd8')
                    .setCurrentXP(userXp)
                    .setOverlay('#000000', 100, false)
                    .setRequiredXP(requiredXp)
                    .setProgressBar('#62d3f5', 'COLOR')
                    .setCustomStatusColor('#000000', 'COLOR')
                    .setBackground('COLOR', '#000000')
                    .setUsername(pushname)
                    .setDiscriminator(shorter)
                rank.build()
                    .then(async (buffer) => {
                        canvas.write(buffer, `${sender}_card.png`)
                        await zen.replyWithPhoto({ source: buffer })
                        fs.unlinkSync(`${sender}_card.png`)
                    })
                .catch(async (err) => {
                    console.error(err)
                    reply('Error!')
                })
            break

            case 'welcome':
            var str = sender
            var shorter = String(str).substr(5, 9);
            const card = new canvas.Welcomer()
            .setUsername(pushname)
                .setDiscriminator(shorter)
                .setGuildName(groupName);
            card.build()
                    .then(async (buffer) => {
                        canvas.write(buffer, `${sender}_card.png`)
                        await zen.replyWithPhoto({ source: buffer })
                        fs.unlinkSync(`${sender}_card.png`)
                    })
                .catch(async (err) => {
                    console.error(err)
                    reply('Error!')
                })
            break

            case 'limit': //Cek Player Limit
			if (!isRegistered) return reply(msg.notRegistered())
			if (isPremium || isOwner) return reply('Limit left: 999999\n\n*_Limit direset setiap menit_*')
			reply(`Limit : ${limit.getLimit(sender, _limit, limitCount)} (25max)\nLimit direset tiap pukul 04:00\n`)
			break
            
            // OWNER
            case 'nsfw':
            if (!isGroup) return reply(msg.groupOnly())
                if (ar[0] === 'enable') {
                if (isNsfw) return reply(msg.nsfwAlready())
                    _nsfw.push(from)
                    fs.writeFileSync('./database/group/nsfw.json', JSON.stringify(_nsfw))
                    reply(msg.nsfwOn())

                } else if (ar[0] === 'disable') {
                    var anu = _nsfw.indexOf(from)
                    _nsfw.splice(anu, 1)
                    fs.writeFileSync('./database/group/nsfw.json', JSON.stringify(_nsfw))
                    reply(msg.nsfwOff())
                } else {
                    reply('Pilih enable atau disable!')
                }
            break

            case 'leveling':
            if (!isGroup) return reply(msg.groupOnly())
                if (ar[0] === 'enable') {
                if (isLevelingOn) return reply(msg.levelingOnAlready())
                    _leveling.push(from)
                    fs.writeFileSync('./database/group/leveling.json', JSON.stringify(_leveling))
                    reply(msg.levelingOn())

                } else if (ar[0] === 'disable') {
                    var anu = _leveling.indexOf(from)
                    _leveling.splice(anu, 1)
                    fs.writeFileSync('./database/group/leveling.json', JSON.stringify(_leveling))
                    reply(msg.levelingOff())
                } else {
                    reply('Pilih enable atau disable!')
                }
            break

            case 'premium': 
            if (!isOwner) return reply(`*Format salah!*\n\nKetik ${prefix}belipremium`)
                if (ar[0] === 'add') {
                premium.addPremiumUser(args[1], args[2], _premium)
                reply(`*「 PREMIUM ADDED 」*\n\n*ID :* ${args[1]}\n*Expired :* ${ms(toMs(args[2])).days} day(s) ${ms(toMs(args[2])).hours} hour(s) ${ms(toMs(args[2])).minutes} minute(s)`)
            } else if (ar[0] === 'del') {
                _premium.splice(premium.getPremiumPosition(args[1], _premium), 1)
                fs.writeFileSync('./database/bot/premium.json', JSON.stringify(_premium))
                await reply(msg.doneOwner())
            } else {
                reply('Pilih add / del')
            }
            break

            default:
                if (!isGroup && !isCmd) {
                    await zen.replyWithChatAction("typing")
                    simi = await fetchJson(`http://api.lolhuman.xyz/api/simi?apikey=${lol}&text=${body}`)
                    await reply(simi.result)
                }
        }
    } catch (e) {
        console.log(chalk.cyanBright("[  ERROR  ]"), chalk.redBright(e))
    }
})


bot.launch()
bot.telegram.getMe().then((getme) => {
    itsPrefix = (prefix != "") ? prefix : "No Prefix"
    console.log(chalk.greenBright(' ===================================================='))
    console.log(chalk.greenBright(" │ + Owner    : " + owner || ""))
    console.log(chalk.greenBright(" │ + Bot Name : " + getme.first_name || ""))
    console.log(chalk.greenBright(" │ + Version  : " + version || ""))
    console.log(chalk.greenBright(" │ + Host     : " + os.hostname() || ""))
    console.log(chalk.greenBright(" │ + Platfrom : " + os.platform() || ""))
    console.log(chalk.greenBright(" │ + Core     : " + os.cpus()[0].model || ""))
    console.log(chalk.greenBright(" │ + Speed    : " + os.cpus()[0].speed || "" + " MHz"))
    console.log(chalk.greenBright(" │ + Core     : " + os.cpus().length || ""))
    console.log(chalk.greenBright(` │ + RAM      : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${Math.round(os.totalmem / 1024 / 1024)} MB`))
    console.log(chalk.greenBright(" │ + Prefix   : " + itsPrefix))
    console.log(chalk.greenBright(' ===================================================='))
    console.log(chalk.whiteBright('╭─── [ LOG ]'))
})
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))