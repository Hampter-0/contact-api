# contact-api

A small contact form API built with Node.js, Express and TypeScript. It takes submissions from my portfolio, checks them, and forwards them to a Discord channel via webhook. It can also send the visitor a confirmation mail.

Everything is configured with a `.env` file, and most parts can be switched on or off without touching the code.

## features

- Discord webhook notifications
- Cloudflare Turnstile (bot protection)
- Rate limiting (default 2 requests per minute per IP)
- Link filter (blocks links and html in name/message)
- Input validation and length limits
- CORS protection
- Confirmation email with an optional signature
- All of it toggleable through `.env`

## tech used

- Node.js + Express 5
- TypeScript
- zod (validation)
- express-rate-limit
- nodemailer
- cors
- dotenv
- vitest (tests)

## setup

### what u need

- Node.js 20 or newer
- A Discord webhook URL (and ofcourse a discord server :) )
- A Cloudflare Turnstile secret key (or turn Turnstile off, see below)
- SMTP details if you want confirmation mails

### installation

1. Clone the repo

```
   git clone https://github.com/Hampter-0/contact-api.git
   cd contact-api
```

2. Install dependencies

```
   npm install
```

3. Copy the example env file and fill it in

```
   cp .env.example .env
```

   (on Windows PowerShell: `Copy-Item .env.example .env`)

4. Start the server

```
   npm run dev
```

If something in your `.env` is missing or wrong, the server stops on startup and tells you exactly what.

### scripts

| Command | What it does |
|---|---|
| `npm run dev` | run with auto restart (development) |
| `npm run build` | compile TypeScript to `dist/` |
| `npm start` | run the compiled build (production) |
| `npm run typecheck` | check types without building |
| `npm test` | run the tests |

## configuration

Everything lives in `.env`, see `.env.example` for all options and their defaults.

### feature toggles

Set these to `true` or `false`.

| Variable | Default | Needs when enabled |
|---|---|---|
| `FEATURE_RATE_LIMIT` | `true` | nothing |
| `FEATURE_TURNSTILE` | `true` | `TURNSTILE_SECRET_KEY` |
| `FEATURE_LINK_FILTER` | `true` | nothing |
| `FEATURE_DISCORD_WEBHOOK` | `true` | `DISCORD_WEBHOOK_URL` |
| `FEATURE_EMAIL_CONFIRMATION` | `false` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| `FEATURE_EMAIL_SIGNATURE` | `true` | nothing (only used if email confirmation is on) |

### other settings

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `3001` | port the server listens on |
| `TRUST_PROXY` | `1` | number of proxies in front of the app |
| `CORS_ORIGINS` | `http://localhost:5173` | allowed origins, comma separated |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | rate limit window |
| `RATE_LIMIT_MAX` | `2` | max requests per window per IP |
| `MAX_NAME_LENGTH` | `100` | max characters in name |
| `MAX_EMAIL_LENGTH` | `100` | max characters in email |
| `MAX_MESSAGE_LENGTH` | `1000` | max characters in message |

Set `CORS_ORIGINS` to your own frontend domain, or the browser will block the requests.

### confirmation email

| Variable | What it does |
|---|---|
| `BRAND_NAME` | name shown as sender and in the signature |
| `EMAIL_SUBJECT` | subject of the mail |
| `EMAIL_BODY` | the message in the mail |

### email signature

The signature is built from these variables. Everything is optional, leave a value empty and that part is skipped. Set `FEATURE_EMAIL_SIGNATURE=false` to drop the signature completely.

| Variable | What it does |
|---|---|
| `SIGNATURE_TITLE` | bold title, for example `Support Team` |
| `SIGNATURE_TAGLINE` | small italic line, for example `Kind regards,` |
| `SIGNATURE_LOGO_URL` | full url to a logo image |
| `SIGNATURE_LOGO_WIDTH` | logo width in pixels (default `140`) |
| `SIGNATURE_CONTACT_EMAIL` | contact address shown as a mailto link |
| `SIGNATURE_WEBSITE_URL` | website link |
| `SIGNATURE_ACCENT_COLOR` | link color (default `#7c3aed`) |

## API

### POST /contact

Validates the message and sends it to discord (and a confirmation mail if enabled).

Request body:

```json
{
  "name": "hampter",
  "email": "hampter@gmail.com",
  "message": "hi!",
  "turnstileToken": "token from the turnstile widget"
}
```

`turnstileToken` is only needed when `FEATURE_TURNSTILE=true`.

Response:

```json
{
  "success": true
}
```

Errors come back as `{ "error": "..." }`:

| Status | When |
|---|---|
| `400` | invalid input, links in the message, or failed Turnstile check |
| `429` | too many requests |
| `500` | something broke on the server |

## project structure

```
src/
├── config/        env parsing, constants and the config object
├── lib/           small helpers (errors, logger, html escape)
├── middleware/    cors, rate limit, error handling
├── modules/
│   └── contact/   filters, schema, service, controller, routes
├── services/      turnstile, discord and mail
├── app.ts         builds the express app
└── server.ts      starts the server
tests/             vitest tests
```

## example reverse proxy configs

### Nginx

```
location /contact {
    # Replace 'localhost:3001' with the host and port where your Node.js app runs
    # For example, if your app runs on port 4000: proxy_pass http://localhost:4000/contact;
    # Keep the '/contact' at the end if your Node route is /contact
    proxy_pass http://localhost:3001/contact;
    # Standard headers for websockets and reverse proxy
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    # Needed so rate limiting sees the real visitor ip
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Optional HTTPS with Lets Encrypt:

```
sudo certbot --nginx -d api.myportfolio.com
```

### Apache

```
<VirtualHost *:443>
    # Replace with your real domain
    ServerName api.myportfolio.com
    ServerAdmin webmaster@localhost

    # Enable SSL
    SSLEngine on
    # Replace these paths with your SSL certificate and key if using https
    SSLCertificateFile /etc/letsencrypt/live/api.myportfolio.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/api.myportfolio.com/privkey.pem

    ProxyPreserveHost On
    ProxyRequests Off

    # Proxy /contact route to Node.js backend
    # Replace 'localhost:3001' if your Node app runs on another port
    ProxyPass /contact http://localhost:3001/contact
    ProxyPassReverse /contact http://localhost:3001/contact

    ErrorLog ${APACHE_LOG_DIR}/api-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/api-ssl-access.log combined
</VirtualHost>
```

For apache also enable the modules:

```
sudo a2enmod proxy proxy_http ssl
sudo systemctl restart apache2
```

If you run the app with no reverse proxy in front of it, set `TRUST_PROXY=0`.

## license

MIT