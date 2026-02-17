import { Router } from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
  setRolePermission,
  getRolePermissions,
  setUserPermission,
  getUserPermissions,
  assignRoleToUser,
  removeRoleFromUser,
} from "../../controller/index.js";
import { authMiddleware, requireRole } from "../../middleware/index.js";

const router = Router();

// All RBAC routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole("admin"));

// Role routes
router.post("/roles", createRole);
router.get("/roles", getAllRoles);
router.get("/roles/:id", getRoleById);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

// Module routes
router.post("/modules", createModule);
router.get("/modules", getAllModules);
router.get("/modules/:id", getModuleById);
router.put("/modules/:id", updateModule);
router.delete("/modules/:id", deleteModule);

// Role permission routes
router.post("/permissions/role", setRolePermission);
router.get("/permissions/role/:roleId", getRolePermissions);

// User permission routes
router.post("/permissions/user", setUserPermission);
router.get("/permissions/user/:userId", getUserPermissions);

// User role assignment
router.post("/users/:userId/role", assignRoleToUser);
router.delete("/users/:userId/role", removeRoleFromUser);

export default router;
