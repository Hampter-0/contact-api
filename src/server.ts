import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./lib/logger";

const app = createApp();

app.listen(config.port, () => {
  logger.info(`server running on port ${config.port}`);
});