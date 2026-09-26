import nodemailer from "nodemailer";
import { config } from "../config";
import { logger } from "../lib/logger";
import { buildConfirmationEmailHtml, buildConfirmationEmailSubject } from "./mail.templates";

function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

// sends the "i received your message" confirmation mail to the person
// who filled in the contact form. does nothing if the feature is off.
// runs in the background, errors are logged but never thrown, so a
// failed confirmation mail never breaks the /contact request itself
export async function sendConfirmationEmail(toEmail: string): Promise<void> {
  if (!config.features.emailConfirmation) {
    return;
  }

  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"${config.email.brandName}" <${config.smtp.from}>`,
      to: toEmail,
      subject: buildConfirmationEmailSubject(),
      text: buildConfirmationEmailSubject(),
      html: buildConfirmationEmailHtml(),
    });

    logger.info("confirmation email sent", info.messageId);
  } catch (err) {
    logger.error("failed to send confirmation email", err);
  }
}