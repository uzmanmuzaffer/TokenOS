import { logger } from "../utils/logger.js";
import { failure } from "../utils/response.js";

export function errorHandler(err, req, res, next) {
  logger.error("Unhandled Error", {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  return failure(
    res,
    err.message || "Internal Server Error",
    err.status || 500
  );
}