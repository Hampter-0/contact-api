import { Router } from "express";
import { createRateLimiter } from "../../middleware/rateLimit";
import { postContact } from "./contact.controller";

export const contactRouter = Router();

contactRouter.post("/contact", createRateLimiter(), postContact);