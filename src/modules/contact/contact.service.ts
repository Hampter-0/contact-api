import { config } from "../../config";
import { contactFields } from "../../config/fields.config";
import { AppError } from "../../lib/errors";
import { logger } from "../../lib/logger";
import { sendDiscordNotification } from "../../services/discord.service";
import { sendConfirmationEmail } from "../../services/mail.service";
import { verifyTurnstileToken } from "../../services/turnstile.service";
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
    for (const field of contactFields) {
      if (field.linkFilterExempt) {
        continue;
      }

      const value = submission[field.key];

      if (value && containsLinks(value)) {
        throw new AppError(400, "links are not allowed");
      }
    }
  }

  if (config.features.turnstile) {
    const isHuman = await verifyTurnstileToken(submission.turnstileToken, remoteIp);

    if (!isHuman) {
      throw new AppError(400, "verification failed");
    }
  }

  // these should never block or fail the response
  sendDiscordNotification(submission).catch((err: unknown) => {
    logger.error("discord notification failed", err);
  });

  // email is only sent if an "email" field is actually configured and filled in,
  // since fields.config.ts could theoretically be set up without one
  const email = submission.email;

  if (email) {
    sendConfirmationEmail(email).catch((err: unknown) => {
      logger.error("confirmation email failed", err);
    });
  }
}