const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Logger = require("@endylus/logger");
const log = new Logger({ filesLog: false });
const config = require("../../input/config.json");
const tokens = fs.readFileSync(path.join(process.cwd(), "./input/tokens.txt"), 'utf8').split(/\r?\n/).filter(token => token !== '' && token !== ' ')

const OUTPUT_DIR = './output';
const OUTPUT_FILES = {
    JOINED: 'joined.txt',
    NOT_JOINED: 'not joined.txt',
    ALREADY_JOINED: 'already joined.txt',
    INVALID_FORMAT: 'invalid format.txt'
};

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

Object.keys(OUTPUT_FILES).forEach(key => {
    OUTPUT_FILES[key] = path.join(OUTPUT_DIR, OUTPUT_FILES[key]);
});

let stats = {
    joined: 0,
    notJoined: 0,
    alreadyJoined: 0,
    invalidFormat: 0,
    count: 1
};

async function authorize(botId, token, index) {
    const tokenParts = token.split(':');

    if (tokenParts.length === 2 || tokenParts.length > 3) {
        stats.invalidFormat++;
        log.warn(`Token: ${tokenParts[0].slice(0, 26)} - Invalid Format! [${index + 1}/${tokens.length}]`);
        fs.appendFileSync(OUTPUT_FILES.INVALID_FORMAT, `${token}\n`);
        return;
    }

    const tkn = tokenParts[tokenParts.length === 1 ? 0 : 2];

    try {
        const startTime = new Date();
        const decodedURL = decodeURIComponent(`https://discord.com/api/oauth2/authorize?client_id=${botId}&redirect_uri=${config.host}:${config.port}&response_type=code&scope=identify+guilds.join`);

        const response = await fetch(decodedURL, {
            headers: { authorization: tkn, "content-type": "application/json" },
            method: "POST",
            body: JSON.stringify({ permissions: "0", authorize: true })
        });
        const data = await response.json();

        if (data.location) {
            const result = await fetch(data.location).then(res => res.json());
            const elapsedTime = (new Date() - startTime) / 1000;
            result.joined ? stats.joined++ : (result.message === "Already Joined" ? stats.alreadyJoined++ : stats.notJoined++);
            fs.appendFileSync(result.joined ? OUTPUT_FILES.JOINED : (result.message === "Already Joined" ? OUTPUT_FILES.ALREADY_JOINED : OUTPUT_FILES.NOT_JOINED), `${token}\n`);
            log.info(`Token: ${tkn.slice(0, 26)} - Joined: ${result.joined ? "Yes" : "No"} - Message: ${result.message} - Time: ${elapsedTime}s - [${stats.count++}/${tokens.length}]`);
        } else {
            stats.notJoined++;
            fs.appendFileSync(OUTPUT_FILES.NOT_JOINED, `${token}\n`);
            log.warn(`Token: ${tkn.slice(0, 26)} - Joined: No - Message: Something went wrong! [${index + 1}/${tokens.length}]`);
        }
    } catch (err) {
        console.log(err);
        stats.notJoined++;
        log.error(`Token: ${tkn.slice(0, 26)} - Error: ${err.message} [${index + 1}/${tokens.length}]`);
        fs.appendFileSync(OUTPUT_FILES.NOT_JOINED, `${token}\n`);
    }
}

async function authorizeTokens(botId, concurrencyLimit = 1, batchSize = 1) {
    let currentIndex = 0;

    async function nextBatch() {
        if (currentIndex >= tokens.length) return;

        const batch = tokens.slice(currentIndex, currentIndex + batchSize);
        currentIndex += batchSize;

        const promises = batch.map((token, index) => authorize(botId, token, currentIndex + index));
        await Promise.all(promises);
        await nextBatch();
    }

    const workers = [];
    for (let i = 0; i < concurrencyLimit; i++) {
        workers.push(nextBatch());
    }

    await Promise.all(workers);

    log.info(`All tokens have been processed!`);
    log.info(`Joined: ${stats.joined} - Not Joined: ${stats.notJoined} - Already Joined: ${stats.alreadyJoined} - Invalid Format: ${stats.invalidFormat}`);
}

module.exports = authorizeTokens;