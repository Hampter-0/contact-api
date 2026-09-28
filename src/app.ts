import express from "express";
import { config } from "./config";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { contactRouter } from "./modules/contact/contact.routes";
import { JSON_BODY_LIMIT } from "./config/constants";

export function createApp() {
  const app = express();

  // needed so express reads the real client ip
  // which the rate limiter relies on when running behind a reverse proxy
  app.set("trust proxy", config.trustProxy);

  app.use(corsMiddleware);
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.use(contactRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}