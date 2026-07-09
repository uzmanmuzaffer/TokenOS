import { failure } from "../utils/response.js";

export function notFound(req, res) {
  return failure(
    res,
    `Route ${req.originalUrl} not found`,
    404
  );
}