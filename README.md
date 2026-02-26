# contact-api

A REST API built with Node.js and Express that handles contact form submissions from my portfolio and forwards them to a Discord channel via webhook.

## features

- Discord webhook integration
- Rate limiting (5 requests per minute per IP)
- CORS protection
- Environment variables via dotenv

## tech used 

- Node.js
- Express
- Axios
- express-rate-limit
- dotenv

## setup

## what u need to start

- Node.js installed
- A Discord webhook URL

### Installation

1. Clone the repo
   git clone https://github.com/Hampter-0/portfolio-contact-api.git

2. Install dependencies
   npm install

3. create .env file ( add in gitignore please )

4. Fill in your discord webhook URL in .env
   WEBHOOK_URL=your webhook url
   PORT=3001 ( or any other free port thats not being used )

5. Start the server
   node index.js

## API

### POST /contact

Sends a message to discord.

Request body:
{
  "name": "hampter",
  "email": "hampter@gmail.com",
  "message": "noob"
}

Response:
{
  "success": true
}

## License

MIT