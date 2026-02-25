const rateLimit = require("express-rate-limit");
const express = require("express");
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
app.use(express.json());
app.use(cors({
    origin: "https://portfolio.hampternom.nl", // for usage replace with your own domain :)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});