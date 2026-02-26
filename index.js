const rateLimit = require("express-rate-limit");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.set("trust proxy", 1);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
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
app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "missing fields" });
    }
    try {
        await axios.post(WEBHOOK_URL, {
            content: `New message\n\n${name}\n${email}\n${message}`
        });
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