import { Request, Response } from "express";
import { adminService } from "../service/index.js";
import { asyncHandler } from "../middleware/index.js";

// Helper function to get param value
const getParam = (req: Request, name: string): string => {
  const value = req.params[name];
  if (Array.isArray(value)) {
    return value[0] ?? "0";
  }
  return value ?? "0";
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users with their roles
 */
export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await adminService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
      message: "Users fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Get user by ID with detailed information
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(getParam(req, "id"), 10);
  const user = await adminService.getUserById(userId);

  res.status(200).json({
    success: true,
    data: user,
    message: "User fetched successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Create a new user (admin creation)
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role_id } = req.body;
  const user = await adminService.createUser({
    name,
    email,
    password,
    role_id,
  });

  res.status(201).json({
    success: true,
    data: user,
    message: "User created successfully",
    statusCode: 201,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Update user details
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(getParam(req, "id"), 10);
  const { name, email, role_id } = req.body;
  const user = await adminService.updateUser(userId, {
    name,
    email,
    role_id,
  });

  res.status(200).json({
    success: true,
    data: user,
    message: "User updated successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Delete user
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(getParam(req, "id"), 10);
  await adminService.deleteUser(userId);

  res.status(200).json({
    success: true,
    data: null,
    message: "User deleted successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Approve user
 */
export const approveUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(getParam(req, "id"), 10);
  await adminService.approveUser(userId);

  res.status(200).json({
    success: true,
    data: null,
    message: "User approved successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Reject/Deactivate user
 */
export const deactivateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(getParam(req, "id"), 10);
    await adminService.deactivateUser(userId);

    res.status(200).json({
      success: true,
      data: null,
      message: "User deactivated successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Activate user
 */
export const activateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(getParam(req, "id"), 10);
    await adminService.activateUser(userId);

    res.status(200).json({
      success: true,
      data: null,
      message: "User activated successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Assign role to user
 */
export const assignRole = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(getParam(req, "id"), 10);
  const { role_id } = req.body;
  await adminService.assignRoleToUser(userId, role_id);

  res.status(200).json({
    success: true,
    data: null,
    message: "Role assigned successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Remove role from user
 */
export const removeRole = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(getParam(req, "id"), 10);
  await adminService.removeRoleFromUser(userId);

  res.status(200).json({
    success: true,
    data: null,
    message: "Role removed successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get pending users (not approved yet)
 */
export const getPendingUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await adminService.getPendingUsers();

    res.status(200).json({
      success: true,
      data: users,
      message: "Pending users fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

// ==================== ROLE MANAGEMENT ====================

/**
 * Create a new role
 */
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const role = await adminService.createRole({ name, description });

  res.status(201).json({
    success: true,
    data: role,
    message: "Role created successfully",
    statusCode: 201,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get all roles
 */
export const getAllRoles = asyncHandler(
  async (_req: Request, res: Response) => {
    const roles = await adminService.getAllRoles();

    res.status(200).json({
      success: true,
      data: roles,
      message: "Roles fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Get role by ID
 */
export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(getParam(req, "id"), 10);
  const role = await adminService.getRoleById(roleId);

  res.status(200).json({
    success: true,
    data: role,
    message: "Role fetched successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Update role
 */
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(getParam(req, "id"), 10);
  const { name, description } = req.body;
  const role = await adminService.updateRole(roleId, { name, description });

  res.status(200).json({
    success: true,
    data: role,
    message: "Role updated successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Delete role
 */
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(getParam(req, "id"), 10);
  await adminService.deleteRole(roleId);

  res.status(200).json({
    success: true,
    data: null,
    message: "Role deleted successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get users by role
 */
export const getUsersByRole = asyncHandler(
  async (req: Request, res: Response) => {
    const roleId = parseInt(getParam(req, "id"), 10);
    const users = await adminService.getUsersByRole(roleId);

    res.status(200).json({
      success: true,
      data: users,
      message: "Users by role fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

// ==================== MODULE MANAGEMENT ====================

/**
 * Create a new module
 */
export const createModule = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, parent_id } = req.body;
    console.log("Controller received:", { name, description, parent_id });
    const module = await adminService.createModule({
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

/**
 * Get all modules
 */
export const getAllModules = asyncHandler(
  async (_req: Request, res: Response) => {
    const modules = await adminService.getAllModules();

    res.status(200).json({
      success: true,
      data: modules,
      message: "Modules fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Get module tree (hierarchical structure)
 */
export const getModuleTree = asyncHandler(
  async (_req: Request, res: Response) => {
    const modules = await adminService.getModuleTree();

    res.status(200).json({
      success: true,
      data: modules,
      message: "Module tree fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Get module by ID
 */
export const getModuleById = asyncHandler(
  async (req: Request, res: Response) => {
    const moduleId = parseInt(getParam(req, "id"), 10);
    const module = await adminService.getModuleById(moduleId);

    res.status(200).json({
      success: true,
      data: module,
      message: "Module fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Get sub-modules by parent ID
 */
export const getSubModules = asyncHandler(
  async (req: Request, res: Response) => {
    const parentId = parseInt(getParam(req, "id"), 10);
    const modules = await adminService.getSubModules(parentId);

    res.status(200).json({
      success: true,
      data: modules,
      message: "Sub-modules fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Update module
 */
export const updateModule = asyncHandler(
  async (req: Request, res: Response) => {
    const moduleId = parseInt(getParam(req, "id"), 10);
    const { name, description, parent_id } = req.body;
    const module = await adminService.updateModule(moduleId, {
      name,
      description,
      parent_id,
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

/**
 * Delete module
 */
export const deleteModule = asyncHandler(
  async (req: Request, res: Response) => {
    const moduleId = parseInt(getParam(req, "id"), 10);
    await adminService.deleteModule(moduleId);

    res.status(200).json({
      success: true,
      data: null,
      message: "Module deleted successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

// ==================== PERMISSION MANAGEMENT (Simplified) ====================

/**
 * Set role module access
 */
export const setRolePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const { role_id, module_id } = req.body;
    await adminService.setRolePermission({
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

/**
 * Get role modules
 */
export const getRolePermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const roleId = parseInt(getParam(req, "roleId"), 10);
    const modules = await adminService.getRolePermissions(roleId);

    res.status(200).json({
      success: true,
      data: modules,
      message: "Role modules fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Set user module access
 */
export const setUserPermission = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id, module_id } = req.body;
    await adminService.setUserPermission({
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

/**
 * Get user modules
 */
export const getUserPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(getParam(req, "userId"), 10);
    const result = await adminService.getUserPermissions(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: "User modules fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

/**
 * Get all permissions matrix (roles x modules)
 */
export const getPermissionsMatrix = asyncHandler(
  async (_req: Request, res: Response) => {
    const matrix = await adminService.getPermissionsMatrix();

    res.status(200).json({
      success: true,
      data: matrix,
      message: "Permissions matrix fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

// ==================== DASHBOARD STATS ====================

/**
 * Get admin dashboard stats
 */
export const getDashboardStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
      message: "Dashboard stats fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);
