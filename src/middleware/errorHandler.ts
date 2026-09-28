import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

// express and body-parser attach a status to their own errors
// (bad json body = 400, body too large = 413, etc)
function getStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status: unknown }).status;

    if (typeof status === "number") {
      return status;
    }
  }

  return undefined;
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "not found" });
}

// express only recognizes this as an error handler if it has all 4 params,
// so keep `next` here even though we don't call it
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // errors we threw ourselves
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // client-side
  const status = getStatus(err);

  if (status !== undefined && status >= 400 && status < 500) {
    res.status(status).json({ error: "bad request" });
    return;
  }

  // anything else is our own bug
  logger.error("unhandled error", err);
  res.status(500).json({ error: "something went wrong" });
}