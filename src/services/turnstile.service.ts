import { config } from "../config";
import { TURNSTILE_VERIFY_URL, HTTP_TIMEOUT_MS } from "../config/constants";
import { logger } from "../lib/logger";

interface TurnstileResponse {
  success: boolean;
}

// checks a turnstile token with cloudflare. returns true if the request
// is human, false if not (or if the feature is off, verification is skipped)
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string | undefined,
): Promise<boolean> {
  if (!config.features.turnstile) {
    return true;
  }

  if (!token) {
    return false;
  }

  const secretKey = config.turnstile.secretKey;

  if (!secretKey) {
    // 
    logger.error("turnstile secret key is missing even though the feature is enabled");
    return false;
  }

  const params = new URLSearchParams();
  params.append("secret", secretKey);
  params.append("response", token);

  if (remoteIp) {
    params.append("remoteip", remoteIp);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: params,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      logger.warn(`turnstile verify request failed with status ${response.status}`);
      return false;
    }

    const data = (await response.json()) as TurnstileResponse;
    return data.success === true;
  } catch (err) {
    logger.error("turnstile verify error", err);
    return false;
  }
}