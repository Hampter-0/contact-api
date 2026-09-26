import { z } from "zod";
import { config } from "../../config";

// keeping this as a function (not a top-level const) so it always reads
// the current config values, useful for tests that tweak limits
export function createContactSchema() {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, "name is required")
      .max(config.limits.name, "name is too long"),

    email: z
      .string()
      .trim()
      .min(1, "email is required")
      .max(config.limits.email, "email is too long")
      .email("invalid email"),

    message: z
      .string()
      .trim()
      .min(1, "message is required")
      .max(config.limits.message, "message is too long"),

    turnstileToken: z.string().optional(),
  });
}

export type ContactInput = z.infer<ReturnType<typeof createContactSchema>>;