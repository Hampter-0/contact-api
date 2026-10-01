// copies .env.example to .env, but only if .env doesn't already exist.
// run with: npm run setup
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const examplePath = path.join(root, ".env.example");
const envPath = path.join(root, ".env");

if (fs.existsSync(envPath)) {
  console.log(".env already exists, leaving it as is.");
  process.exit(0);
}

if (!fs.existsSync(examplePath)) {
  console.error(".env.example not found, nothing to copy.");
  process.exit(1);
}

fs.copyFileSync(examplePath, envPath);
console.log("Created .env from .env.example. Fill in your real values before starting the server.");