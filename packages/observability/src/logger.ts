import pino, { type Logger, type LoggerOptions } from "pino"

/**
 * Structured logger factory (NFR-9). Redacts common secret-bearing fields so
 * tokens/keys never leak into logs. Level is env-driven; pretty output in dev.
 */
export function createLogger(name: string, options: LoggerOptions = {}): Logger {
  const isDev = process.env.NODE_ENV !== "production"
  return pino({
    name,
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "*.password",
        "*.token",
        "*.secret",
        "*.key_secret",
        "*.api_key",
      ],
      censor: "[REDACTED]",
    },
    ...options,
  })
}

export type { Logger }
