import { Router } from "express";
import {
  // User Management
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  approveUser,
  deactivateUser,
  activateUser,
  assignRole,
  removeRole,
  getPendingUsers,
  // Role Management
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getUsersByRole,
  // Module Management
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
  getModuleTree,
  getSubModules,
  // Permission Management
  setRolePermission,
  getRolePermissions,
  setUserPermission,
  getUserPermissions,
  getPermissionsMatrix,
  // Dashboard Stats
  getDashboardStats,
} from "../../controller/index.js";
import { authMiddleware, requireRole } from "../../middleware/index.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole("admin"));

// ==================== DASHBOARD STATS ====================
router.get("/dashboard/stats", getDashboardStats);

// ==================== USER MANAGEMENT ====================
router.get("/users", getAllUsers);
router.get("/users/pending", getPendingUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// User Status Management
router.post("/users/:id/approve", approveUser);
router.post("/users/:id/activate", activateUser);
router.post("/users/:id/deactivate", deactivateUser);

// User Role Assignment
router.post("/users/:id/role", assignRole);
router.delete("/users/:id/role", removeRole);

// ==================== ROLE MANAGEMENT ====================
router.get("/roles", getAllRoles);
router.get("/roles/:id", getRoleById);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);
router.get("/roles/:id/users", getUsersByRole);

// ==================== MODULE MANAGEMENT ====================
router.get("/modules", getAllModules);
router.get("/modules/tree", getModuleTree);
router.get("/modules/:id", getModuleById);
router.get("/modules/:id/submodules", getSubModules);
router.post("/modules", createModule);
router.put("/modules/:id", updateModule);
router.delete("/modules/:id", deleteModule);

// ==================== PERMISSION MANAGEMENT ====================
router.get("/permissions/matrix", getPermissionsMatrix);
router.post("/permissions/role", setRolePermission);
router.get("/permissions/role/:roleId", getRolePermissions);
router.post("/permissions/user", setUserPermission);
router.get("/permissions/user/:userId", getUserPermissions);

export default router;
