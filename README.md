# contact-api

A REST API built with Node.js and Express that handles contact form submissions from my portfolio and forwards them to a Discord channel via webhook.

## features

- Discord webhook integration
- Rate limiting (2 requests per minute per IP) u can change this in the index.js to ur liking :)
- CORS protection
- ENV with dotenv

## tech used 

- Node.js
- Express
- Axios
- express-rate-limit
- dotenv

## setup

## what u need to start

- Node.js installed
- A Discord webhook URL and ofcoure a server :)

### Installation

1. Clone the repo
   git clone https://github.com/Hampter-0/portfolio-contact-api.git

2. Install dependencies
   npm install

3. create .env file ( add in gitignore please )

4. add in your discord webhook URL in .env
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

### Example reverse proxy configs

## Nginx:
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
}
```
Optional HTTPS: with Lets Encrypt:

sudo certbot --nginx -d api.myportfolio.com

## Apache:

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
for apache also enable Apache modules:

sudo a2enmod proxy proxy_http ssl

sudo systemctl restart apache2

## License

MIT
