import { Request, Response } from "express";
import { rbacService } from "../service/index.js";
import { asyncHandler } from "../middleware/index.js";

// Helper function to get param value
const getParam = (req: Request, name: string): string => {
  const value = req.params[name];
  if (Array.isArray(value)) {
    return value[0] ?? "0";
  }
  return value ?? "0";
};

// Role Controllers
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const role = await rbacService.createRole({ name, description });

  res.status(201).json({
    success: true,
    data: role,
    message: "Role created successfully",
    statusCode: 201,
    timestamp: new Date().toISOString(),
  });
});

export const getAllRoles = asyncHandler(
  async (_req: Request, res: Response) => {
    const roles = await rbacService.getAllRoles();

    res.status(200).json({
      success: true,
      data: roles,
      message: "Roles fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(getParam(req, "id"), 10);
  const role = await rbacService.getRoleById(roleId);

  res.status(200).json({
    success: true,
    data: role,
    message: "Role fetched successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(getParam(req, "id"), 10);
  const { name, description } = req.body;
  const role = await rbacService.updateRole(roleId, { name, description });

  res.status(200).json({
    success: true,
    data: role,
    message: "Role updated successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(getParam(req, "id"), 10);
  await rbacService.deleteRole(roleId);

  res.status(200).json({
    success: true,
    data: null,
    message: "Role deleted successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

// Module Controllers
export const createModule = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, parent_id } = req.body;
    const module = await rbacService.createModule({
      name,
      description,
      parent_id,
    });

    res.status(201).json({
      success: true,
      data: module,
      message: "Module created successfully",
      statusCode: 201,
      timestamp: new Date().toISOString(),
    });
  },
);

export const getAllModules = asyncHandler(
  async (_req: Request, res: Response) => {
    const modules = await rbacService.getAllModules();

    res.status(200).json({
      success: true,
      data: modules,
      message: "Modules fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const getModuleById = asyncHandler(
  async (req: Request, res: Response) => {
    const moduleId = parseInt(getParam(req, "id"), 10);
    const module = await rbacService.getModuleById(moduleId);

    res.status(200).json({
      success: true,
      data: module,
      message: "Module fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const updateModule = asyncHandler(
  async (req: Request, res: Response) => {
    const moduleId = parseInt(getParam(req, "id"), 10);
    const { name, description } = req.body;
    const module = await rbacService.updateModule(moduleId, {
      name,
      description,
    });

    res.status(200).json({
      success: true,
      data: module,
      message: "Module updated successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const deleteModule = asyncHandler(
  async (req: Request, res: Response) => {
    const moduleId = parseInt(getParam(req, "id"), 10);
    await rbacService.deleteModule(moduleId);

    res.status(200).json({
      success: true,
      data: null,
      message: "Module deleted successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

// Permission Controllers (Simplified - no more granular permissions)
export const setRolePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const { role_id, module_id } = req.body;
    await rbacService.setRoleModule({
      role_id,
      module_id,
    });

    res.status(200).json({
      success: true,
      data: null,
      message: "Role module access set successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const getRolePermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const roleId = parseInt(getParam(req, "roleId"), 10);
    const modules = await rbacService.getRoleModules(roleId);

    res.status(200).json({
      success: true,
      data: modules,
      message: "Role modules fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const setUserPermission = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id, module_id } = req.body;
    await rbacService.setUserModule({
      user_id,
      module_id,
    });

    res.status(200).json({
      success: true,
      data: null,
      message: "User module access set successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const getUserPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(getParam(req, "userId"), 10);
    const result = await rbacService.getUserModules(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: "User modules fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const assignRoleToUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(getParam(req, "userId"), 10);
    const { role_id } = req.body;
    await rbacService.assignRoleToUser(userId, role_id);

    res.status(200).json({
      success: true,
      data: null,
      message: "Role assigned to user successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const removeRoleFromUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(getParam(req, "userId"), 10);
    await rbacService.removeRoleFromUser(userId);

    res.status(200).json({
      success: true,
      data: null,
      message: "Role removed from user successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

// Remove user module permission
export const removeUserPermission = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(getParam(req, "userId"), 10);
    const moduleId = parseInt(getParam(req, "moduleId"), 10);
    await rbacService.removeUserModule(userId, moduleId);

    res.status(200).json({
      success: true,
      data: null,
      message: "User module permission removed successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);
