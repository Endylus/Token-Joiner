// https://discord.gg/dctoken
const fs = require("fs");
const fetch = require("node-fetch");
const config = require("../config.js");
const path = require("path");

let i = 0;

(async () => {
  const filePath = path.join(__dirname, '../tokens.txt');
  const cleanedFilePath = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const token of cleanedFilePath) {
    try {
      let data = await fetch(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=http%3A%2F%2Flocalhost%3A3001&response_type=code&scope=identify%20email%20guilds.join`, { "headers": { "authorization": token, "content-type": "application/json" }, "body": "{\"permissions\":\"0\",\"authorize\":true}", "method": "POST" }).then(x => x.json())
      if (data.location) {
        fetch(data?.location).then(x => x.json()).then(x => {
          if (x.joined) {
            i++
            console.log(i + " - " + x.message)
          }
        }).catch(err => { })
      }
    } catch (err) { }
  }
})();
// https://discord.gg/dctoken