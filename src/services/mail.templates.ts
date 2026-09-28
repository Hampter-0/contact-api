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

  let logoHtml = "";

  if (sig.logoUrl) {
    logoHtml = `
      <tr>
        <td style="padding: 6px 0;">
          <img
            style="display: block;"
            src="${escapeHtml(sig.logoUrl)}"
            alt="${escapeHtml(sig.title || config.email.brandName)}"
            width="${sig.logoWidth}"
          />
        </td>
      </tr>`;
  }

  let contactRowHtml = "";

  if (sig.contactEmail) {
    contactRowHtml = `
      <span style="font-size: 12px; color: #333333;">
        Contact us here:
        
          style="color: ${accent}; font-weight: bold; text-decoration: none;"
          href="mailto:${escapeHtml(sig.contactEmail)}"
        >
          ${escapeHtml(sig.contactEmail)}
        </a>
      </span>
      <br />`;
  }

  let websiteRowHtml = "";

  if (sig.websiteUrl) {
    websiteRowHtml = `
      <span style="font-size: 12px; color: #333333;">
        
          style="color: ${accent}; font-weight: bold; text-decoration: none;"
          href="${escapeHtml(sig.websiteUrl)}"
        >
          ${escapeHtml(sig.websiteUrl.toUpperCase())}
        </a>
      </span>`;
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
              <span style="font-weight: bold; font-size: 14px; color: #000000;">
                ${escapeHtml(sig.title || config.email.brandName)}
              </span>
              <br />
              <span style="font-size: 12px; color: #888888;">
                ${escapeHtml(config.email.brandName)}
              </span>
            </td>
          </tr>
          ${
            sig.tagline
              ? `<tr>
                  <td style="padding-bottom: 10px;">
                    <span style="font-size: 12px; font-style: italic; color: #888888;">
                      ${escapeHtml(sig.tagline)}
                    </span>
                  </td>
                </tr>`
              : ""
          }
          ${logoHtml}
          <tr>
            <td style="padding-top: 10px; border-top: 1px solid #dddddd;">
              ${contactRowHtml}
              ${websiteRowHtml}
            </td>
          </tr>
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