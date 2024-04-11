const fs = require("fs");
const fetch = require("node-fetch");
const config = require("../config.json");
const path = require("path");
const tokens = fs.readFileSync(path.join(__dirname, '../tokens.txt'), 'utf8').split(/\r?\n/);

const OUTPUT_DIR = `./data/`;
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
const JOINED = path.join(process.cwd(), OUTPUT_DIR, 'joined.txt');
const NOT_JOINED = path.join(process.cwd(), OUTPUT_DIR, 'not joined.txt');
const ALREADY_JOINED = path.join(process.cwd(), OUTPUT_DIR, 'already joined.txt');
const INVALID_FORMAT = path.join(process.cwd(), OUTPUT_DIR, 'invalid format.txt');
const INVALID_TOKENS = path.join(process.cwd(), OUTPUT_DIR, 'invalid tokens.txt');

let joined = 0;
let notJoined = 0;
let alreadyJoined = 0;
let invalidFormat = 0;

async function authorizeTokens() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  try {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      let tokenParts = token.split(':');
      if (tokenParts.length == 2 || tokenParts.length > 3) {
        invalidFormat++;
        console.log(`[${getCurrentTime()}] Token: ${tokenParts[0].slice(0, 26)} - Invalid Format! [${i + 1}/${tokens.length}]`);
        fs.appendFileSync(INVALID_FORMAT, `${token}\n`);
        continue;
      }

      const index = tokenParts.length === 1 ? 0 : 2;
      const tkn = tokenParts[index];
      try {
        let startTime = new Date();
        let data = await fetch(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=http%3A%2F%2Flocalhost%3A3001&response_type=code&scope=identify%20email%20guilds.join`, {
          headers: { authorization: tkn, "content-type": "application/json" },
          body: JSON.stringify({ permissions: "0", authorize: true }),
          method: "POST"
        }).then(x => x.json());

        if (data.location) {
          let result = await fetch(data.location).then(x => x.json());
          let endTime = new Date();
          let elapsedTime = endTime - startTime;
          let elapsedTimeInSeconds = elapsedTime / 1000;
          result.joined ? joined++ : (result.message === "Already Joined" ? alreadyJoined++ : notJoined++);
          fs.appendFileSync(result.joined ? JOINED : (result.message === "Already Joined" ? ALREADY_JOINED : NOT_JOINED), `${token}\n`);
          console.log(`[${getCurrentTime()}] Token: ${tkn.slice(0, 26)} - Joined: ${result.joined ? "Yes" : "No"} - Message: ${result.message} - Time: ${elapsedTimeInSeconds}s - [${i + 1}/${tokens.length}]`);
        } else if (data.code === 0) {
          notJoined++;
          console.log(`[${getCurrentTime()}] Token: ${tkn.slice(0, 26)} - Invalid Token! [${i + 1}/${tokens.length}]`);
          fs.appendFileSync(INVALID_TOKENS, `${token}\n`);
        }
      } catch (err) {
        notJoined++;
        console.log(`[${getCurrentTime()}] Token: ${tkn.slice(0, 26)} - Error: ${err.message} [${i + 1}/${tokens.length}]`);
      }
    }
    console.log(`[${getCurrentTime()}] All tokens have been joined!`);
    console.log(`[${getCurrentTime()}] Joined: ${joined} - Not Joined: ${notJoined} - Already Joined: ${alreadyJoined} - Invalid Format: ${invalidFormat}`);
    process.exit(0);
  } catch (error) {
    notJoined++;
    console.error(`[${getCurrentTime()}] Error: ${error.message}`);
  }
}

function getCurrentTime() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

module.exports = authorizeTokens;