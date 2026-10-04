import fs from "node:fs";
import path from "node:path";
import Mustache from "mustache";
import nodemailer from "nodemailer";
import { config } from "../config";
import type { ContactSubmission } from "../config/fields.config";
import { findSubmitterEmail, getSubmittedFields } from "../lib/fieldsList";
import { logger } from "../lib/logger";
import { buildConfirmationEmailHtml, buildConfirmationEmailSubject } from "./mail.templates";

const templatesDir = path.join(__dirname, "..", "..", "templates");

let notificationEmailTemplate: string | undefined;

function getNotificationEmailTemplate(): string {
  if (!notificationEmailTemplate) {
    const filePath = path.join(templatesDir, "notification-email.txt");
    notificationEmailTemplate = fs.readFileSync(filePath, "utf-8");
  }

  return notificationEmailTemplate;
}

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

// sends a plain-text summary of the submission to the site owner's own
// inbox, with reply-to set to the visitor (if an email field is
// configured), so hitting reply goes straight to them. does nothing if
// the feature is off. runs in the background, errors are logged but
// never thrown.
export async function sendNotificationEmail(submission: ContactSubmission): Promise<void> {
  if (!config.features.emailNotification) {
    return;
  }

  const notifyEmail = config.notification.email;

  if (!notifyEmail) {
    logger.error("notification email address is missing even though the feature is enabled");
    return;
  }

  try {
    const transporter = createTransporter();
    const fields = getSubmittedFields(submission);
    const text = Mustache.render(getNotificationEmailTemplate(), { fields });
    const replyTo = findSubmitterEmail(submission);

    const info = await transporter.sendMail({
      from: `"${config.email.brandName}" <${config.smtp.from}>`,
      to: notifyEmail,
      replyTo,
      subject: config.notification.subject,
      text,
    });

    logger.info("notification email sent", info.messageId);
  } catch (err) {
    logger.error("failed to send notification email", err);
  }
}