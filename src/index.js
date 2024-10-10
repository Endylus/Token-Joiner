const express = require('express');
const fetch = require('node-fetch');
const { Client, GatewayIntentBits } = require('discord.js');
const authorizeTokens = require('./utils/authorizeTokens');
const Logger = require("@endylus/logger");
const log = new Logger({ filesLog: false });
const config = require("../../input/config.json");

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const port = config.port;
let guildId;
let botId;

async function connectToDiscord() {
  try {
    await client.login(config.token);
    const server = config.invite_link;
    const inviteLink = server.split('/').pop();
    const inviteData = await fetch(`https://discordapp.com/api/v9/invites/${inviteLink}`).then(res => res.json());

    if (inviteData.code === 10006) return log.error(`Invalid Invite Code: ${inviteLink}`);

    guildId = inviteData.guild.id;
    botId = client.user.id;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) return log.error(`Couldn't find the guild with ID: ${guildId}`);

    log.info(`Connected to Guild: ${guild.name}`);
    log.info(`Guild ID: ${guildId}`);
    log.info(`Member Count: ${guild.memberCount}`);
    log.info(`Invite URL: ${server}`);

    authorizeTokens(botId);
  } catch (error) {
    log.error(`Failed to connect to Discord: ${error.message}`);
  }
}

async function getDiscordToken(code) {
  try {
    const tokenResponseData = await fetch('https://discord.com/api/oauth2/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: botId,
        client_secret: config.secret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${config.host}:${port}`,
        scope: 'identify',
      }),
      method: 'POST'
    }).then(res => res.json());
    return tokenResponseData;
  } catch (error) {
    return { error: error.message }
  }
}

async function getDiscordUser(token) {
  try {
    const userResponseData = await fetch('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${token.token_type} ${token.access_token}`
      },
      method: 'GET'
    }).then(res => res.json());
    return userResponseData;
  } catch (error) {
    return { error: error.message }
  }
}

app.get('/', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(404).json({ joined: false, message: `Request missing 'code' parameter` });

    const tokenResponseData = await getDiscordToken(code);    
    if (tokenResponseData.error) return res.status(404).json({ joined: false, message: `Reason: ${tokenResponseData.error}` });

    const userResponseData = await getDiscordUser(tokenResponseData);
    if (tokenResponseData.error) return res.status(404).json({ joined: false, message: `Reason: ${tokenResponseData.error}` });

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ joined: false, message: `Couldn't find the guild with ID: ${guildId}` });

    guild.members.add(userResponseData.id, { accessToken: tokenResponseData.access_token })
      .then(() => {
        res.status(200).json({ joined: true, message: "Joined the server!" });
      }).catch(err => {
        console.log(err);
        if (err.message === "Cannot read properties of undefined (reading 'id')") return res.status(404).json({ joined: false, message: "Already Joined" });
        res.status(404).json({ joined: false, message: err.message });
      });
  } catch (err) {
    res.status(404).json({ joined: false, message: `Request failed: ${err.message}` });
  }
});

app.listen(port, () => {
  log.info(`Server listening on port ${port}`);
  connectToDiscord();
});