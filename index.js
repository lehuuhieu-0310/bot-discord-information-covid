const { Client, Intents } = require('discord.js')
const axios = require('axios').default
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
require('dotenv').config()

client.login(process.env.TOKEN)

client.on('ready', () => {
    console.log('ready!')
})

client.on('messageCreate', message => {
    if (message.content === 'covid') {
        setInterval(async function sendMessage() {
            const data = await axios.get(process.env.API)
            const dataCovid = data.data.CovidVN
            message.channel.send(`
            ${dataCovid.CapNhat}
            Hôm nay: 
                Nhiễm: ${dataCovid.HomNay.nhiem}
                Khỏi: ${dataCovid.HomNay.khoi}
                Tử vong: ${dataCovid.HomNay.tuvong}
            Tổng:
                Nhiêm: ${dataCovid.Tong.nhiem}
                Khỏi: ${dataCovid.Tong.khoi}
                Tử vong: ${dataCovid.Tong.tuvong}`)
            return sendMessage
        }, 86400000)
    }
})