import { describe, expect, it } from "vitest";
import { createContactSchema } from "../src/modules/contact/contact.schema";

describe("contact schema", () => {
  const schema = createContactSchema();

  it("accepts a valid submission", () => {
    const result = schema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "hello there",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = schema.safeParse({
      name: "",
      email: "jane@example.com",
      message: "hello there",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = schema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
      message: "hello there",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a message that is too long", () => {
    const tooLong = "a".repeat(2000);

    const result = schema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: tooLong,
    });

    expect(result.success).toBe(false);
  });
});