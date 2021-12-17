const { Client, Intents, MessageEmbed } = require('discord.js')
const axios = require('axios').default
const schedule = require('node-schedule')

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
require('dotenv').config()

client.login(process.env.TOKEN)

client.on('ready', () => {
    console.log('ready!')

    //id your server
    const guildId = process.env.GUILD_ID
    const guild = client.guilds.cache.get(guildId)

    let commands

    if (guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'ping',
        description: 'Replies with pong'
    })
    commands?.create({
        name: 'server',
        description: 'Replies with server info'
    })
    commands?.create({
        name: 'user',
        description: 'Replies with user info'
    })
    commands?.create({
        name: 'covid',
        description: 'Replies with information of covid in VietNam'
    })
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    const { commandName } = interaction
    if (commandName === 'ping') {
        await interaction.reply('Pong!')
    } else if (commandName === 'server') {
        await interaction.reply('Server info.')
    } else if (commandName === 'user') {
        await interaction.reply(`${interaction.user.username}`)
    } else if (commandName === 'covid') {
        await interaction.deferReply()
        const data = await axios(process.env.API)
        const dataCovid = data.data.CovidVN
        await interaction.editReply(`
            ${dataCovid.CapNhat}
            - Hôm nay: 
                Nhiễm: ${dataCovid.HomNay.nhiem}
                Khỏi: ${dataCovid.HomNay.khoi}
                Tử vong: ${dataCovid.HomNay.tuvong}
            - Tổng:
                Nhiêm: ${dataCovid.Tong.nhiem}
                Khỏi: ${dataCovid.Tong.khoi}
                Tử vong: ${dataCovid.Tong.tuvong}
        `)
    }
})

client.on('messageCreate', async (message) => {
    if (message.content === '!covid') {
        message.reply('Scheduled Task')
        schedule.scheduleJob('getInfoCovid', { tz: 'Asia/Bangkok', hour: 19 }, async () => {
            const data = await axios(process.env.API)
            const dataCovid = data.data.CovidVN

            const embed = new MessageEmbed()
                .setColor('#F1B199')
                .setTitle(`Covid-19 tại Việt Nam: ${dataCovid.CapNhat}`)
                .setDescription(`
                - Hôm nay: 
                    Nhiễm: ${dataCovid.HomNay.nhiem}
                    Khỏi: ${dataCovid.HomNay.khoi}
                    Tử vong: ${dataCovid.HomNay.tuvong}
                - Tổng:
                    Nhiêm: ${dataCovid.Tong.nhiem}
                    Khỏi: ${dataCovid.Tong.khoi}
                    Tử vong: ${dataCovid.Tong.tuvong}
            `)
                .setTimestamp()
                .setFooter('Data is crawl from vnexpress.vn')

            message.channel.send({ embeds: [embed] })
        })
    } else if (message.content === '!cancel') {
        let my_job = schedule.scheduledJobs['getInfoCovid']
        if (my_job === undefined) {
            return message.reply('Not Found Scheduled Task')
        }
        my_job.cancel()
        message.reply('Cancel Scheduled Task')
    }
})