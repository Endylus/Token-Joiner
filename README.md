# Discord oauth2 token joiner

This project allows adding tokens to servers via bots using the Discord OAuth2 authorization protocol.

## Config

1. Go to [Discord developers](https://discord.com/developers/applications)



https://github.com/user-attachments/assets/a672aba6-f54f-493d-baf5-425d07e52c42


2. `config.json` Edit the file to configure the program. An example configuration is as follows:

```json
{
  "token": "TOKEN",
  "secret": "SECRET_CODE",

  "host": "http://localhost",
  "port": "443",
  
  "invite_link": "https://discord.gg/tokenverse"
}
```

- `token`: Your Discord bot's token.
- `secret`: Your Discord bot's secret code.
- `host`: The web address where the program will run. For example: `http://localhost`.
- `port`: The port number on which the program will run. The recommended value is usually `443`
- `invite_link`: Invite link to join the server. For example: `https://discord.gg/tokenverse`, `tokenverse`

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

If you have any questions, feel free to join my Discord server: [https://discord.gg/tokenverse](https://discord.gg/tokenverse)
