// src/utils/logger.ts

/**
 * Centralized Logger for PH Healthcare Server
 * Filters logs based on the environment to keep production logs clean.
 */

const time = () => new Date().toISOString();

export const logger = {
  info: (msg: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[${time()}] [INFO]: ${msg}`);
    }
  },

  success: (msg: string) => {
    console.log(`[${time()}] [SUCCESS]: ${msg}`);
  },

  error: (msg: string, err?: unknown) => {
    // Errors are always logged
    if (err instanceof Error) {
      console.error(`[${time()}] [ERROR]: ${msg} → ${err.message}`);
    } else {
      console.error(`[${time()}] [ERROR]: ${msg}`, err ?? "");
    }
  },

  warn: (msg: string) => {
    console.warn(`[${time()}] [WARN]: ${msg}`);
  },
};
