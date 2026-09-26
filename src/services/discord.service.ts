import { config } from "../config";
import { DISCORD_MAX_CONTENT_LENGTH, HTTP_TIMEOUT_MS } from "../config/constants";
import { logger } from "../lib/logger";

// sends the contact form details to a discord webhook.
// does nothing if the feature is off
export async function sendDiscordNotification(
  name: string,
  email: string,
  message: string,
): Promise<void> {
  if (!config.features.discordWebhook) {
    return;
  }

  const webhookUrl = config.discord.webhookUrl;

  if (!webhookUrl) {
    logger.error("discord webhook url is missing even though the feature is enabled");
    return;
  }

  let content = `New message\n\n${name}\n${email}\n${message}`;

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