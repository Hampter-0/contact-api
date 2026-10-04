import "dotenv/config";

// collect all errors here so you see everything wrong at once,
// not one by one every time you restart
const errors: string[] = [];

function getString(name: string): string | undefined {
  const value = process.env[name];

  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();

  // empty line in .env (like SMTP_HOST=) counts as not set
  if (trimmed === "") {
    return undefined;
  }

  return trimmed;
}

function getStringWithDefault(name: string, fallback: string): string {
  const value = getString(name);

  if (value === undefined) {
    return fallback;
  }

  return value;
}

function getNumber(name: string, fallback: number): number {
  const value = getString(name);

  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    errors.push(`${name} must be a number (got "${value}")`);
    return fallback;
  }

  return parsed;
}

function getOptionalNumber(name: string): number | undefined {
  const value = getString(name);

  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    errors.push(`${name} must be a number (got "${value}")`);
    return undefined;
  }

  return parsed;
}

function getBoolean(name: string, fallback: boolean): boolean {
  const value = getString(name);

  if (value === undefined) {
    return fallback;
  }

  const lower = value.toLowerCase();

  if (lower === "true") {
    return true;
  }

  if (lower === "false") {
    return false;
  }

  errors.push(`${name} must be "true" or "false" (got "${value}")`);
  return fallback;
}

// "a, b, c" -> ["a", "b", "c"]
function getList(name: string, fallback: string): string[] {
  const value = getStringWithDefault(name, fallback);

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

function getNodeEnv(): "development" | "production" | "test" {
  const value = getStringWithDefault("NODE_ENV", "development");

  if (value === "development" || value === "production" || value === "test") {
    return value;
  }

  errors.push(`NODE_ENV must be development, production or test (got "${value}")`);
  return "development";
}

export const env = {
  // server
  NODE_ENV: getNodeEnv(),
  PORT: getNumber("PORT", 3001),
  TRUST_PROXY: getNumber("TRUST_PROXY", 1),
  CORS_ORIGINS: getList("CORS_ORIGINS", "http://localhost:5173"),

  // feature toggles
  FEATURE_RATE_LIMIT: getBoolean("FEATURE_RATE_LIMIT", true),
  FEATURE_TURNSTILE: getBoolean("FEATURE_TURNSTILE", true),
  FEATURE_LINK_FILTER: getBoolean("FEATURE_LINK_FILTER", true),
  FEATURE_DISCORD_WEBHOOK: getBoolean("FEATURE_DISCORD_WEBHOOK", true),
  FEATURE_EMAIL_CONFIRMATION: getBoolean("FEATURE_EMAIL_CONFIRMATION", false),
  FEATURE_EMAIL_SIGNATURE: getBoolean("FEATURE_EMAIL_SIGNATURE", true),
  FEATURE_EMAIL_NOTIFICATION: getBoolean("FEATURE_EMAIL_NOTIFICATION", false),

  // limits
  RATE_LIMIT_WINDOW_SECONDS: getNumber("RATE_LIMIT_WINDOW_SECONDS", 60),
  RATE_LIMIT_MAX: getNumber("RATE_LIMIT_MAX", 2),

  // turnstile
  TURNSTILE_SECRET_KEY: getString("TURNSTILE_SECRET_KEY"),

  // discord
  DISCORD_WEBHOOK_URL: getString("DISCORD_WEBHOOK_URL"),

  // smtp
  SMTP_HOST: getString("SMTP_HOST"),
  SMTP_PORT: getOptionalNumber("SMTP_PORT"),
  SMTP_SECURE: getBoolean("SMTP_SECURE", false),
  SMTP_USER: getString("SMTP_USER"),
  SMTP_PASS: getString("SMTP_PASS"),
  SMTP_FROM: getString("SMTP_FROM"),

  // confirmation mail
  BRAND_NAME: getStringWithDefault("BRAND_NAME", "My Portfolio"),
  EMAIL_SUBJECT: getStringWithDefault("EMAIL_SUBJECT", "I received your message"),
  EMAIL_BODY: getStringWithDefault("EMAIL_BODY", "I have received your message! I'll try to reply within 48 hours :)"),
  NOTIFICATION_EMAIL: getString("NOTIFICATION_EMAIL"),
  NOTIFICATION_EMAIL_SUBJECT: getStringWithDefault(
    "NOTIFICATION_EMAIL_SUBJECT",
    "New contact form submission",
  ),

  // signature
  SIGNATURE_NAME: getString("SIGNATURE_NAME"),
  SIGNATURE_TITLE: getString("SIGNATURE_TITLE"),
  SIGNATURE_TAGLINE: getString("SIGNATURE_TAGLINE"),
  SIGNATURE_LOGO_URL: getString("SIGNATURE_LOGO_URL"),
  SIGNATURE_LOGO_WIDTH: getNumber("SIGNATURE_LOGO_WIDTH", 140),
  SIGNATURE_ADDRESS_LINE1: getString("SIGNATURE_ADDRESS_LINE1"),
  SIGNATURE_ADDRESS_LINE2: getString("SIGNATURE_ADDRESS_LINE2"),
  SIGNATURE_PHONE: getString("SIGNATURE_PHONE"),
  SIGNATURE_CONTACT_EMAIL: getString("SIGNATURE_CONTACT_EMAIL"),
  SIGNATURE_WEBSITE_URL: getString("SIGNATURE_WEBSITE_URL"),
  SIGNATURE_DISCORD_LINK: getString("SIGNATURE_DISCORD_LINK"),
  SIGNATURE_FOOTER_NOTE: getString("SIGNATURE_FOOTER_NOTE"),
  SIGNATURE_ACCENT_COLOR: getStringWithDefault("SIGNATURE_ACCENT_COLOR", "#7c3aed"),
};

// some vars are only needed when a feature is turned on
function requireWhenEnabled(enabled: boolean, feature: string, names: string[]): void {
  if (!enabled) {
    return;
  }

  for (const name of names) {
    if (getString(name) === undefined) {
      errors.push(`${name} is required when ${feature} is true`);
    }
  }
}

requireWhenEnabled(env.FEATURE_TURNSTILE, "FEATURE_TURNSTILE", ["TURNSTILE_SECRET_KEY"]);

requireWhenEnabled(env.FEATURE_DISCORD_WEBHOOK, "FEATURE_DISCORD_WEBHOOK", [
  "DISCORD_WEBHOOK_URL",
]);

// SMTP is needed if EITHER the confirmation email or the notification
// email is turned on, since they share the same mail transport
if (env.FEATURE_EMAIL_CONFIRMATION || env.FEATURE_EMAIL_NOTIFICATION) {
  requireWhenEnabled(true, "FEATURE_EMAIL_CONFIRMATION or FEATURE_EMAIL_NOTIFICATION", [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
  ]);
}

requireWhenEnabled(env.FEATURE_EMAIL_NOTIFICATION, "FEATURE_EMAIL_NOTIFICATION", [
  "NOTIFICATION_EMAIL",
]);

if (errors.length > 0) {
  console.error("Invalid environment configuration:");

  for (const error of errors) {
    console.error(`  - ${error}`);
  }

  process.exit(1);
}