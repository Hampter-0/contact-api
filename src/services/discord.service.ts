import fs from "node:fs";
import path from "node:path";
import Mustache from "mustache";
import { config } from "../config";
import { DISCORD_MAX_CONTENT_LENGTH, HTTP_TIMEOUT_MS } from "../config/constants";
import { contactFields } from "../config/fields.config";
import type { ContactSubmission } from "../config/fields.config";
import { getSubmittedFields } from "../lib/fieldsList";
import { logger } from "../lib/logger";

const templatesDir = path.join(__dirname, "..", "..", "templates");

let discordMessageTemplate: string | undefined;

function getDiscordMessageTemplate(): string {
  if (!discordMessageTemplate) {
    const filePath = path.join(templatesDir, "discord-message.txt");
    discordMessageTemplate = fs.readFileSync(filePath, "utf-8");
  }

  return discordMessageTemplate;
}

// builds the discord message by rendering templates/discord-message.txt
// with the submitted fields spliced in as loop data
function buildContent(submission: ContactSubmission): string {
  const emailLabel = contactFields.find((field) => field.type === "email")?.label;
  const fields = getSubmittedFields(submission).map((field) => ({
    ...field,
    isEmail: field.label === emailLabel,
  }));

  return Mustache.render(getDiscordMessageTemplate(), { fields });
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