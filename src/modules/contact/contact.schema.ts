import { z } from "zod";
import { contactFields } from "../../config/fields.config";
import type { ContactSubmission } from "./contact.types";

function buildFieldSchema(field: (typeof contactFields)[number]): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  if (field.type === "select") {
    const options = field.options;

    if (!options || options.length === 0) {
      throw new Error(`field "${field.key}" is type "select" but has no options`);
    }

    const [first, ...rest] = options;

    if (first === undefined) {
      throw new Error(`field "${field.key}" is type "select" but has no options`);
    }

    schema = z.enum([first, ...rest]);
  } else {
    let stringSchema = z.string().trim();

    if (field.type === "email") {
      stringSchema = stringSchema.email(`${field.label} must be a valid email`);
    }

    if (field.maxLength !== undefined) {
      stringSchema = stringSchema.max(field.maxLength, `${field.label} is too long`);
    }

    schema = stringSchema;
  }

  if (field.required) {
    if (schema instanceof z.ZodString) {
      return schema.min(1, `${field.label} is required`);
    }

    // enums are "required" by default already, there's no empty-string
    // case to reject, zod rejects anything not in `options` already
    return schema;
  }

  return schema.optional();
}

// builds the whole contact form schema from fields.config.ts, plus the
// fixed turnstileToken field that every submission carries regardless
// of which contact fields are configured.
//
// the per-field types are dynamic (driven by fields.config.ts), so
// typescript can't infer a precise output type on its own here.

export function createContactSchema(): z.ZodType<ContactSubmission> {
  const shape: Record<string, z.ZodTypeAny> = {
    turnstileToken: z.string().optional(),
  };

  for (const field of contactFields) {
    shape[field.key] = buildFieldSchema(field);
  }

  return z.object(shape) as unknown as z.ZodType<ContactSubmission>;
}