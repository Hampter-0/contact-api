import { env } from "./env";

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  port: env.PORT,
  trustProxy: env.TRUST_PROXY,
  corsOrigins: env.CORS_ORIGINS,

  features: {
    rateLimit: env.FEATURE_RATE_LIMIT,
    turnstile: env.FEATURE_TURNSTILE,
    linkFilter: env.FEATURE_LINK_FILTER,
    discordWebhook: env.FEATURE_DISCORD_WEBHOOK,
    emailConfirmation: env.FEATURE_EMAIL_CONFIRMATION,
    emailSignature: env.FEATURE_EMAIL_SIGNATURE,
  },

  limits: {
    name: env.MAX_NAME_LENGTH,
    email: env.MAX_EMAIL_LENGTH,
    message: env.MAX_MESSAGE_LENGTH,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_SECONDS * 1000,
    max: env.RATE_LIMIT_MAX,
  },

  turnstile: {
    secretKey: env.TURNSTILE_SECRET_KEY,
  },

  discord: {
    webhookUrl: env.DISCORD_WEBHOOK_URL,
  },

  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  },

  email: {
    brandName: env.BRAND_NAME,
    subject: env.EMAIL_SUBJECT,
    body: env.EMAIL_BODY,
  },

  signature: {
    title: env.SIGNATURE_TITLE,
    tagline: env.SIGNATURE_TAGLINE,
    logoUrl: env.SIGNATURE_LOGO_URL,
    logoWidth: env.SIGNATURE_LOGO_WIDTH,
    contactEmail: env.SIGNATURE_CONTACT_EMAIL,
    websiteUrl: env.SIGNATURE_WEBSITE_URL,
    accentColor: env.SIGNATURE_ACCENT_COLOR,
  },
};