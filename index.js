const rateLimit = require("express-rate-limit");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const app = express();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

app.set("trust proxy", 1);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 2,
    message: { error: "Too many requests" }
});

app.use("/contact", limiter);
app.use(cors({
    origin: "https://portfolio.hampternom.nl", // for usage replace with your own domain :)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const WEBHOOK_URL = process.env.WEBHOOK_URL;

function containsLinks(text) {
    return /https?:\/\/[^\s]+/gi.test(text) ||
        /www\.[^\s]+/gi.test(text) ||
        /discord\.gg\/[^\s]+/gi.test(text) ||
        /<[^>]+>/g.test(text);
}

app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "missing fields" });
    }

    if (name.length > 100 || email.length > 100 || message.length > 100) {
        return res.status(400).json({ error: "to many caracters" });
    }

    if (!email.includes("@")) {
        return res.status(400).json({ error: "invalid email" });
    }

    if (containsLinks(name) || containsLinks(message)) {
        return res.status(400).json({ error: "links are not allowed" });
    }

    try {
        await axios.post(WEBHOOK_URL, {
            content: `New message\n\n${name}\n${email}\n${message}`
        });

        const nodemailer = require("nodemailer");

        async function sendMail() {
            const transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: SMTP_PORT,
                secure: SMTP_SECURE,
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASS
                }
            });

            const info = await transporter.sendMail({
                from: `"HampterNom.nl (portfolio contact)" <${process.env.SMTP_FROM}>`,
                to: email,
                subject: "confirmation",
                text: "confirmation",
                html: `
    <p>
        <b>I have received your message! I'll try and reply within 48 hours :)</b>
    </p>

    <p>&nbsp;</p>

    <div id="_rc_sig">
        --
        <br />

        <table
            style="font-family: Arial, Helvetica, sans-serif; color: #333333;"
            border="0"
            cellspacing="0"
            cellpadding="0"
        >
            <tbody>
                <tr>
                    <td style="padding-bottom: 4px;">
                        <span style="font-weight: bold; font-size: 14px; color: #000000;">
                            Support Team
                        </span>
                        <br />
                        <span style="font-size: 12px; color: #888888;">
                            Hampternom.nl
                        </span>
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom: 10px;">
                        <span style="font-size: 12px; font-style: italic; color: #888888;">
                            Kind regards,
                        </span>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 6px 0;">
                        <img
                            style="display: block;"
                            src="https://hampternom.nl/assets/logos/hampternom.nl.png"
                            alt="Hampternom.nl"
                            width="140"
                        />
                    </td>
                </tr>

                <tr>
                    <td style="padding-top: 10px; border-top: 1px solid #dddddd;">
                        <span style="font-size: 12px; color: #333333;">
                            Contact us here:
                            <a
                                style="color: #7c3aed; font-weight: bold; text-decoration: none;"
                                href="mailto:support@hampternom.nl"
                            >
                                support@hampternom.nl
                            </a>
                        </span>

                        <br />

                        <span style="font-size: 12px; color: #333333;">
                            <a
                                style="color: #7c3aed; font-weight: bold; text-decoration: none;"
                                href="https://hampternom.nl"
                            >
                                HAMPTERNOM.NL
                            </a>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
`
            });

            console.log("Message sent:", info.messageId);
        }

        sendMail().catch(console.error);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "webhook failed" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});