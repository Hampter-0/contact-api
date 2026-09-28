import { config } from "../../config";
import { AppError } from "../../lib/errors";
import { logger } from "../../lib/logger";
import { verifyTurnstileToken } from "../../services/turnstile.service";
import { sendDiscordNotification } from "../../services/discord.service";
import { sendConfirmationEmail } from "../../services/mail.service";
import { containsLinks } from "./contact.filters";
import type { ContactSubmission } from "./contact.types";

// runs all the business rules and side effects for a contact form submission.
// throws AppError for anything the client did wrong (400s),
// side effects (discord, mail) never throw, they just log on failure
export async function handleContactSubmission(
  submission: ContactSubmission,
  remoteIp: string | undefined,
): Promise<void> {
  if (config.features.linkFilter) {
    if (containsLinks(submission.name) || containsLinks(submission.message)) {
      throw new AppError(400, "links are not allowed");
    }
  }

  if (config.features.turnstile) {
    const isHuman = await verifyTurnstileToken(submission.turnstileToken, remoteIp);

    if (!isHuman) {
      throw new AppError(400, "verification failed");
    }
  }

  // fire and forget, these should never block or fail the response
  sendDiscordNotification(submission.name, submission.email, submission.message).catch(
    (err: unknown) => {
      logger.error("discord notification failed", err);
    },
  );

  sendConfirmationEmail(submission.email).catch((err: unknown) => {
    logger.error("confirmation email failed", err);
  });
}