const express = require('express');
const fetch = require('node-fetch');
const { Client, GatewayIntentBits } = require('discord.js');
const { web, bot, inviteUrl } = require("../config.json");
const start = require('./main.js');

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const port = web.port;
let guildId;
let botId;

// Zaman fonksiyonu
function getCurrentTime() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

// Discord'a bağlanma ve sunucu bilgisini alma
async function connectToDiscord() {
  await client.login(bot.token);
  client.on('ready', async () => {
    console.log(`[Server Join Process] ${getCurrentTime()} - ${client.user.tag} ready!`);
    const server = inviteUrl;
    const inviteLink = server.split('/').pop();
    const inviteData = await fetch(`https://discordapp.com/api/v9/invites/${inviteLink}`).then(res => res.json());
    if (inviteData.code == 10006) return console.log(`[ERROR] ${getCurrentTime()} - Invalid Invite Link!`);
    guildId = inviteData.guild.id;
    botId = client.user.id;
    const guild = client.guilds.cache.get(inviteData.guild.id);
    if (!guild) return console.log(`[ERROR] ${getCurrentTime()} - Couldn't find the guild with ID: ${inviteData.guild.id}`);

    const guildName = guild.name;
    const memberCount = guild.memberCount;
    console.log(`\nServer Information\n-----------------------------\nServer Name: ${guildName}\nMember Count: ${memberCount}\nInvite URL: ${server}\n-----------------------------\n`);
    start();
  });
}

// Discord token almak için OAuth2 işlemi
async function getDiscordToken(code) {
  const tokenResponseData = await fetch('https://discord.com/api/oauth2/token', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: botId,
      client_secret: bot.secret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `${web.url}:${port}`,
      scope: 'identify',
    }),
    method: 'POST'
  }).then(res => res.json());
  return tokenResponseData;
}

// Discord kullanıcı bilgisini almak
async function getDiscordUser(token) {
  const userResponseData = await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${token.token_type} ${token.access_token}`
    },
    method: 'GET'
  }).then(res => res.json());
  return userResponseData;
}

// Ana endpoint
app.get('/', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(404).json({ joined: false, message: "Not Found Code" });

    const tokenResponseData = await getDiscordToken(code);
    if (!tokenResponseData) return res.status(404).json({ joined: false, message: "Not Found Code" });

    const userResponseData = await getDiscordUser(tokenResponseData);
    if (!userResponseData) return res.status(404).json({ joined: false, message: "Not Found User" });

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ joined: false, message: "Not Found Guild" });

    guild.members.add(userResponseData.id, { accessToken: tokenResponseData.access_token }).then(() => {
      res.status(200).json({ joined: true, message: "Joined the server!" });
    }).catch(err => {
      if (err.message == "Cannot read properties of undefined (reading 'id')") {
        return res.status(404).json({ joined: false, message: "Already Joined" });
      }
      res.status(404).json({ joined: false, message: err.message });
    });
  } catch (err) {
    res.status(404).json({ joined: false, message: err.message });
  }
});

// Sunucuya bağlanma ve dinleme
app.listen(port, () => {
  connectToDiscord();
});