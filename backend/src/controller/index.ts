export {
  signUp,
  signIn,
  refreshToken,
  logout,
  getCurrentUser,
} from "./auth.controller.js";

export {
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
} from "./rbac.controller.js";

export {
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
  getUsersByRole,
  // Permission Management
  getPermissionsMatrix,
  // Dashboard Stats
  getDashboardStats,
} from "./admin.controller.js";
