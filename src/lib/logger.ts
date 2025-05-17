import pino from "pino";
import { LOG_LEVEL } from "../constants";

const logger = pino({
  name: "skillsync-core",
  level: LOG_LEVEL,
  transport: (process.env.NODE_ENV !== "production")
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

const createLoggerWithContext = (
  correlationKey: string | undefined = undefined
) => {
  return {
    info: (msg: string, data: Record<string, unknown> = {}) =>
      logger.info({ correlationKey, ...data }, msg),
    warn: (msg: string, data: Record<string, unknown> = {}) =>
      logger.warn({ correlationKey, ...data }, msg),
    error: (msg: string, data: Record<string, unknown> = {}) =>
      logger.error({ correlationKey, ...data }, msg),
    debug: (msg: string, data: Record<string, unknown> = {}) =>
      logger.debug({ correlationKey, ...data }, msg),
  };
};

export { createLoggerWithContext as logger };