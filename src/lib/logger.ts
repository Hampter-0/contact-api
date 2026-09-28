
function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, ...extra: unknown[]): void {
    console.log(`[${timestamp()}] INFO  ${message}`, ...extra);
  },

  warn(message: string, ...extra: unknown[]): void {
    console.warn(`[${timestamp()}] WARN  ${message}`, ...extra);
  },

  error(message: string, ...extra: unknown[]): void {
    console.error(`[${timestamp()}] ERROR ${message}`, ...extra);
  },
};