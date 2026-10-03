import fs from "node:fs";
import path from "node:path";
import Mustache from "mustache";
import { config } from "../config";

const templatesDir = path.join(__dirname, "..", "..", "templates");

function loadTemplate(fileName: string): string {
  const filePath = path.join(templatesDir, fileName);
  return fs.readFileSync(filePath, "utf-8");
}

// cache templates in memory, no need to read from disk on every email
let confirmationEmailTemplate: string | undefined;
let signatureTemplate: string | undefined;

function getConfirmationEmailTemplate(): string {
  if (!confirmationEmailTemplate) {
    confirmationEmailTemplate = loadTemplate("confirmation-email.html");
  }

  return confirmationEmailTemplate;
}

function getSignatureTemplate(): string {
  if (!signatureTemplate) {
    signatureTemplate = loadTemplate("signature.html");
  }

  return signatureTemplate;
}

function buildSignatureHtml(): string {
  if (!config.features.emailSignature) {
    return "";
  }

  const sig = config.signature;

  const websiteDisplay = sig.websiteUrl
    ? sig.websiteUrl.replace(/^https?:\/\//, "").toUpperCase()
    : "";

  const hasInfoRow = Boolean(sig.addressLine1 || sig.phone || sig.websiteUrl);
  const hasFooterRow = Boolean(sig.contactEmail || sig.discordLink || sig.footerNote);

  return Mustache.render(getSignatureTemplate(), {
    name: sig.name,
    title: sig.title,
    tagline: sig.tagline,
    logoUrl: sig.logoUrl,
    logoWidth: sig.logoWidth,
    addressLine1: sig.addressLine1,
    addressLine2: sig.addressLine2,
    phone: sig.phone,
    contactEmail: sig.contactEmail,
    websiteUrl: sig.websiteUrl,
    websiteDisplay,
    discordLink: sig.discordLink,
    footerNote: sig.footerNote,
    accentColor: sig.accentColor,
    hasInfoRow,
    hasFooterRow,
  });
}

// the html body of the confirmation mail sent back to whoever filled in the form
export function buildConfirmationEmailHtml(): string {
  const signatureHtml = buildSignatureHtml();

  return Mustache.render(getConfirmationEmailTemplate(), {
    body: config.email.body,
    hasSignature: signatureHtml.length > 0,
    signatureHtml,
  });
}

export function buildConfirmationEmailSubject(): string {
  return config.email.subject;
}