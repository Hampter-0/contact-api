import { config } from "../config";
import { escapeHtml } from "../lib/html";

// builds the signature at the bottom of the confirmation mail.
// returns an empty string if the feature is off

function buildSignatureHtml(): string {
  if (!config.features.emailSignature) {
    return "";
  }

  const sig = config.signature;
  const accent = escapeHtml(sig.accentColor);

  let nameHtml = "";

  if (sig.name) {
    nameHtml = `
      <span style="font-weight: bold; font-size: 14px; color: #000000;">
        ${escapeHtml(sig.name)}
      </span>
      <br />`;
  }

  let titleHtml = "";

  if (sig.title) {
    titleHtml = `
      <span style="font-weight: bold; font-size: 13px; color: #888888;">
        ${escapeHtml(sig.title)}
      </span>
      <br />`;
  }

  let taglineHtml = "";

  if (sig.tagline) {
    taglineHtml = `
      <tr>
        <td style="padding-bottom: 10px;">
          <span style="font-size: 12px; font-style: italic; color: #888888;">
            ${escapeHtml(sig.tagline)}
          </span>
        </td>
      </tr>`;
  }

  let logoHtml = "";

  if (sig.logoUrl) {
    logoHtml = `
      <tr>
        <td style="padding: 6px 0;">
          <img
            style="display: block;"
            src="${escapeHtml(sig.logoUrl)}"
            alt="${escapeHtml(sig.name || sig.title || config.email.brandName)}"
            width="${sig.logoWidth}"
          />
        </td>
      </tr>`;
  }

  let addressHtml = "";

  if (sig.addressLine1 || sig.addressLine2) {
    const line1 = sig.addressLine1 ? `${escapeHtml(sig.addressLine1)}<br />` : "";
    const line2 = sig.addressLine2 ? escapeHtml(sig.addressLine2) : "";

    addressHtml = `
      <span style="font-size: 12px; color: #333333; font-weight: bold;">
        ${line1}${line2}
      </span>`;
  }

  let phoneHtml = "";

  if (sig.phone) {
    phoneHtml = `
      <span style="font-size: 12px; color: #333333;">
        T <span style="color: ${accent}; font-weight: bold;">${escapeHtml(sig.phone)}</span>
      </span>
      <br />`;
  }

  let websiteHtml = "";

  if (sig.websiteUrl) {
    websiteHtml = `
    Website:
      <a
        style="font-size: 12px; color: ${accent}; font-weight: bold; text-decoration: none;"
        href="${escapeHtml(sig.websiteUrl)}"
      >
        ${escapeHtml(sig.websiteUrl)}
      </a>`;
  }

  let infoRowHtml = "";

  if (addressHtml || phoneHtml || websiteHtml) {
    infoRowHtml = `
      <tr>
        <td style="padding-top: 10px;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tbody>
              <tr>
                <td style="vertical-align: top; padding-right: 24px;">
                  ${addressHtml}
                </td>
                <td style="vertical-align: top;">
                  ${phoneHtml}${websiteHtml}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>`;
  }

  let discordHtml = "";

  if (sig.discordLink) {
    discordHtml = `
      <span style="font-size: 12px; color: #333333;">
        Join our discord:
        <a
          style="color: ${accent}; font-weight: bold; text-decoration: none;"
          href="${escapeHtml(sig.discordLink)}"
        >
          ${escapeHtml(sig.discordLink)}
        </a>
      </span>
      <br />`;
  }

  let contactHtml = "";

  if (sig.contactEmail) {
    contactHtml = `
      <span style="font-size: 12px; color: #333333;">
        Contact us here:
        <a
          style="color: ${accent}; font-weight: bold; text-decoration: none;"
          href="mailto:${escapeHtml(sig.contactEmail)}"
        >
          ${escapeHtml(sig.contactEmail)}
        </a>
      </span>
      <br />`;
  }

  let noteHtml = "";

  if (sig.footerNote) {
    noteHtml = `
      <span style="font-size: 12px; color: #888888;">
        ${escapeHtml(sig.footerNote)}
      </span>`;
  }

  let footerRowHtml = "";

  if (contactHtml || discordHtml || noteHtml) {
    footerRowHtml = `
      <tr>
        <td style="padding-top: 10px; border-top: 1px solid #dddddd;">
          ${contactHtml}${discordHtml}${noteHtml}
        </td>
      </tr>`;
  }

  return `
    <p>&nbsp;</p>
    <div id="_rc_sig">
      --
      <br />
      <table
        style="font-family: Arial, Helvetica, sans-serif; color: #333333;"
        border="0"
        cellspacing="0"
        cellpadding="0"
      >
        <tbody>
          <tr>
            <td style="padding-bottom: 4px;">
              ${nameHtml}${titleHtml}
            </td>
          </tr>
          ${taglineHtml}
          ${logoHtml}
          ${infoRowHtml}
          ${footerRowHtml}
        </tbody>
      </table>
    </div>`;
}

// the html body of the confirmation mail sent back to whoever filled in the form
export function buildConfirmationEmailHtml(): string {
    const body = escapeHtml(config.email.body);
    const signature = buildSignatureHtml();

    return `
    <p>
      <b>${body}</b>
    </p>
    ${signature}`;
}

export function buildConfirmationEmailSubject(): string {
    return config.email.subject;
}