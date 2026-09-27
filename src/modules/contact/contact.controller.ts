import type { Request, Response } from "express";
import { createContactSchema } from "./contact.schema";
import { handleContactSubmission } from "./contact.service";

export async function postContact(req: Request, res: Response): Promise<void> {
  const schema = createContactSchema();
  const result = schema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? "invalid input" });
    return;
  }

  await handleContactSubmission(result.data, req.ip);

  res.json({ success: true });
}