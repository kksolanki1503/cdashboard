import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError, ZodIssue } from "zod";
import { ValidationError } from "../error/index.js";

export const validateRequest =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        next(new ValidationError("Validation failed", errorDetails));
      } else {
        next(error);
      }
    }
  };
