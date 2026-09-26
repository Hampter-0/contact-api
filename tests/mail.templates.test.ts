import { describe, expect, it } from "vitest";
import {
  buildConfirmationEmailHtml,
  buildConfirmationEmailSubject,
} from "../src/services/mail.templates";

describe("mail templates", () => {
  it("builds a subject line", () => {
    const subject = buildConfirmationEmailSubject();
    expect(typeof subject).toBe("string");
    expect(subject.length).toBeGreaterThan(0);
  });

  it("builds html that contains the confirmation body", () => {
    const html = buildConfirmationEmailHtml();
    expect(html).toContain("<b>");
  });

  it("never contains unescaped script tags from config values", () => {
    const html = buildConfirmationEmailHtml();
    expect(html).not.toMatch(/<script/i);
  });
});