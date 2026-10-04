import { describe, expect, it } from "vitest";
import { findSubmitterEmail, getSubmittedFields } from "../src/lib/fieldsList";

describe("getSubmittedFields", () => {
  it("returns label/value pairs for filled fields, in config order", () => {
    const result = getSubmittedFields({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "hello there",
    });

    expect(result).toEqual([
      { label: "Name", value: "Jane Doe" },
      { label: "Email", value: "jane@example.com" },
      { label: "Message", value: "hello there" },
    ]);
  });

  it("skips fields that are empty or missing", () => {
    const result = getSubmittedFields({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "",
    });

    expect(result).toEqual([
      { label: "Name", value: "Jane Doe" },
      { label: "Email", value: "jane@example.com" },
    ]);
  });
});

describe("findSubmitterEmail", () => {
  it("finds the value of the configured email-type field", () => {
    const result = findSubmitterEmail({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "hello there",
    });

    expect(result).toBe("jane@example.com");
  });

  it("returns undefined when the email field is empty", () => {
    const result = findSubmitterEmail({
      name: "Jane Doe",
      email: "",
      message: "hello there",
    });

    expect(result).toBeUndefined();
  });
});