import { Request, Response, NextFunction } from "express";
import { pool } from "../config/index.js";
import { permissionRepository } from "../repository/index.js";
import { ForbiddenError, UnauthorizedError } from "../error/index.js";
import { AuthRequest } from "./authMiddleware.js";

type PermissionType = "read" | "write" | "delete" | "update";

export const requirePermission = (
  moduleName: string,
  permissionType: PermissionType,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      next(new UnauthorizedError("User not authenticated"));
      return;
    }

    const hasPermission = await permissionRepository.hasPermission(
      userId,
      moduleName,
      permissionType,
    );

    if (!hasPermission) {
      next(
        new ForbiddenError(
          `You don't have ${permissionType} permission for ${moduleName}`,
        ),
      );
      return;
    }

    next();
  };
};

export const requireRole = (roleName: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      next(new UnauthorizedError("User not authenticated"));
      return;
    }

    // Get user with role
    const [rows] = await pool.execute(
      `SELECT u.id, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [userId],
    );

    const users = rows as { id: number; role_name: string | null }[];
    const user = users[0];

    if (!user || user.role_name !== roleName) {
      next(new ForbiddenError(`This action requires ${roleName} role`));
      return;
    }

    next();
  };
};
