import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../util/index.js";
import { UnauthorizedError } from "../error/index.js";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new UnauthorizedError("No token provided"));
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    next(new UnauthorizedError("No token provided"));
    return;
  }

  try {
    const decoded = verifyToken(token);
    (req as AuthRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
