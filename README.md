# Discord oauth2 token joiner

This project allows adding tokens to servers via bots using the Discord OAuth2 authorization protocol.

## Config

1. Go to [Discord developers](https://discord.com/developers/applications)

A. **Create Bot**

![botCreate](https://github.com/Endylus/test/assets/122468378/6012e34e-47cf-412d-94d7-23162d956dd7)

B. **Get Secret Code**

![getScretCode](https://github.com/Endylus/test/assets/122468378/8a88c340-6d4d-4f03-87a8-3467e060cb39)

C. **Add Redirects** (http://url:port)

![addRedirects](https://github.com/Endylus/test/assets/122468378/e4aeed6c-bf7a-46de-ba0a-0840ecc20802)

D. **Enable Intents**

![Intents](https://github.com/Endylus/test/assets/122468378/48e61c6f-7088-486f-bd07-f7965a086869)

E. **Get the Token**

![getToken](https://github.com/Endylus/test/assets/122468378/4d8b7e15-7bce-4fba-a64f-0aa3f9ddff48)

2. `config.json` Edit the file to configure the program. An example configuration is as follows:

```json
{
    "inviteUrl": "https://discord.gg/dctoken",
    "bot": {
        "token": "TOKEN",
        "secret": "SECRET_CODE"
    },
    "web": {
        "url": "http://localhost",
        "port": 443
    }
}
```

- `inviteUrl`: Invite link to join the server. For example: `https://discord.gg/dctoken`, `dctoken`
- `bot.token`: Your Discord bot's token.
- `bot.secret`: Your Discord bot's secret code.
- `web.url`: The web address where the program will run. For example: `http://localhost`.
- `web.port`: The port number on which the program will run. The recommended value is usually `443`

## Installation

- Install Node.js - [Download](https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi)

1. Install the required packages:

```
npm install
```

2. Run the script:

```
node .
```

## Disclaimer
No responsibility is accepted for any issues arising from the use of this project and its content. The project is the responsibility of users to configure and use on their own systems. Users should take necessary precautions and follow configuration instructions correctly before using the project.

## Support

If you have any questions, feel free to join my Discord server: [https://discord.gg/dctoken](https://discord.gg/dctoken)
