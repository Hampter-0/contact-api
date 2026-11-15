import { Router } from "express";

export const healthRouter = Router();

// simple liveness check for uptime monitors and status pages.
// returns 200 as long as the server is up and able to respond.
// deliberately has no rate limit and doesn't touch discord/smtp/turnstile,
// so a monitor polling this never triggers any side effects
healthRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});