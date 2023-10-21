// https://discord.gg/dctoken
const express = require('express')
const app = express()
const port = 3001
const { web, bot, data } = require("../config.js");

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const axios = require('axios').default;

app.get('/', async (req, res) => {
  try {
    let query = req.query.code
    if (!query) return res.status(404).send("Not Found Code")

    const tokenResponseData = await axios({
      method: 'POST',
      url: 'https://discord.com/api/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams({
        client_id: bot.id,
        client_secret: bot.secret,
        code: query,
        grant_type: 'authorization_code',
        redirect_uri: `${web.url}`,
        scope: 'identify',
      }).toString()
    }).then(x => x.data);

    if (!tokenResponseData) return res.status(404).send("Not Found Code")

    const userResponseData = await axios({
      method: 'GET',
      url: 'https://discord.com/api/users/@me',
      headers: {
        authorization: `${tokenResponseData.token_type} ${tokenResponseData.access_token}`
      }
    }).then(x => x.data);

    if (!userResponseData) return res.status(404).send("Not Found Code")

    let guild = client.guilds.cache.get(data.guildId)
    if (!guild) return res.status(404).json({ joined: false, message: "Not Found Guild" })

    guild.members.add(userResponseData.id, { accessToken: tokenResponseData.access_token }).then(() => {
      res.status(200).json({ joined: true, message: `[Endy - Bot] ${userResponseData.username}#${userResponseData.discriminator} (${userResponseData.id}) joined the server!` })
    }).catch(err => {
      res.status(404).json({ joined: false, message: `[Endy - Bot] ${userResponseData.username}#${userResponseData.discriminator} (${userResponseData.id}) Failed join the server! - ` + err.message })
    })
  } catch (err) {
    res.status(404).send("Not Found Code")
  }
})

app.listen(port, () => {
  client.login(bot.token)
  client.on('ready', () => {
    console.log(`[Endy - Bot] ${client.user.tag} ready!`);
    setTimeout(() => {
      require('./main.js')
    }, 3000);
  });
})
// https://discord.gg/dctoken