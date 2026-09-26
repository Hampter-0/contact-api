import type { NextFunction, Request, RequestHandler, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { config } from "../config";

export function createRateLimiter(): RequestHandler {
  // feature is off, so just let everything through
  if (!config.features.rateLimit) {
    return (req: Request, res: Response, next: NextFunction): void => {
      next();
    };
  }

  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
  });
}