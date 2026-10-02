import { config } from "../config";
import { DISCORD_MAX_CONTENT_LENGTH, HTTP_TIMEOUT_MS } from "../config/constants";
import { contactFields, type ContactSubmission } from "../config/fields.config";
import { logger } from "../lib/logger";

// builds the discord message body by looping over the configured fields,
// in the order they're declared in fields.config.ts. fields with no
// value (optional and left empty) are skipped.
function buildContent(submission: ContactSubmission): string {
  const lines: string[] = [];

  for (const field of contactFields) {
    const value = submission[field.key];

    if (value) {
      lines.push(`**${field.label}:** ${value}`);
    }
  }

  return `New message\n\n${lines.join("\n")}`;
}

// sends the contact form details to a discord webhook.
// does nothing if the feature is off
export async function sendDiscordNotification(submission: ContactSubmission): Promise<void> {
  if (!config.features.discordWebhook) {
    return;
  }

  const webhookUrl = config.discord.webhookUrl;

  if (!webhookUrl) {
    logger.error("discord webhook url is missing even though the feature is enabled");
    return;
  }

  let content = buildContent(submission);

  if (content.length > DISCORD_MAX_CONTENT_LENGTH) {
    content = content.slice(0, DISCORD_MAX_CONTENT_LENGTH - 3) + "...";
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      logger.warn(`discord webhook request failed with status ${response.status}`);
    }
  } catch (err) {
    logger.error("discord webhook error", err);
  }
}