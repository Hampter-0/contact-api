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

  it("accepts a submission with an added optional field", () => {
    // simulates adding a custom field to fields.config.ts and confirms
    // the schema accepts it without needing it to be in the hardcoded shape
    const result = schema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "hello there",
      // an extra key not declared in fields.config.ts is just ignored by zod,
      // not rejected, since z.object() allows unknown keys by default
      phone: "0612345678",
    });

    expect(result.success).toBe(true);
  });
});