import { Request, Response, NextFunction } from "express";
import { AppError } from "../error/index.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: (err as AppError & { details?: unknown }).details,
      },
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Unexpected errors
  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
    statusCode: 500,
    timestamp: new Date().toISOString(),
  });
};
