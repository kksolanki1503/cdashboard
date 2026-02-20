import { Request, Response, NextFunction } from "express";
import { pool } from "../config/index.js";
import { permissionRepository, userRepository } from "../repository/index.js";
import { ForbiddenError, UnauthorizedError } from "../error/index.js";
import { AuthRequest } from "./authMiddleware.js";

type PermissionType = "read" | "write" | "delete" | "update";

export const requirePermission = (
  moduleName: string,
  _permissionType: PermissionType,
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

    // Get user with role
    const user = await userRepository.findById(userId);
    if (!user) {
      next(new UnauthorizedError("User not found"));
      return;
    }

    // Simplified permission check - just check if user has access to the module
    // (either through their role or through extra user permissions)
    const hasAccess = await permissionRepository.hasModuleAccess(
      userId,
      user.role_id,
      moduleName,
    );

    if (!hasAccess) {
      next(new ForbiddenError(`You don't have access to ${moduleName}`));
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
