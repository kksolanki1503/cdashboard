import { pool } from "../config/index.js";
import {
  RoleModule,
  UserModule,
  CreateRoleModuleDTO,
  CreateUserModuleDTO,
  ModuleAccessDTO,
  // Legacy types for backwards compatibility
  PermissionMaster,
  CreatePermissionMasterDTO,
  PermissionResponseDTO,
} from "../types/index.js";

export class PermissionRepository {
  // ==================== ROLE MODULES (Simplified) ====================

  // Add module access to a role
  async addRoleModule(data: CreateRoleModuleDTO): Promise<RoleModule> {
    await pool.execute(
      `INSERT INTO role_modules (role_id, module_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE role_id = role_id`,
      [data.role_id, data.module_id],
    );

    const [rows] = await pool.execute(
      `SELECT * FROM role_modules WHERE role_id = ? AND module_id = ?`,
      [data.role_id, data.module_id],
    );

    const modules = rows as RoleModule[];
    return modules[0] as RoleModule;
  }

  // Get all modules a role has access to
  async getRoleModules(roleId: number): Promise<RoleModule[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM role_modules WHERE role_id = ?`,
      [roleId],
    );
    return rows as RoleModule[];
  }

  // Check if a role has access to a module
  async hasRoleModule(roleId: number, moduleId: number): Promise<boolean> {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM role_modules WHERE role_id = ? AND module_id = ?`,
      [roleId, moduleId],
    );
    const result = rows as { count: number }[];
    return (result[0]?.count ?? 0) > 0;
  }

  // Remove module access from a role
  async removeRoleModule(roleId: number, moduleId: number): Promise<void> {
    await pool.execute(
      `DELETE FROM role_modules WHERE role_id = ? AND module_id = ?`,
      [roleId, moduleId],
    );
  }

  // Remove all module access from a role
  async removeAllRoleModules(roleId: number): Promise<void> {
    await pool.execute(`DELETE FROM role_modules WHERE role_id = ?`, [roleId]);
  }

  // ==================== USER MODULES (Simplified) ====================

  // Add extra module access to a user
  async addUserModule(data: CreateUserModuleDTO): Promise<UserModule> {
    await pool.execute(
      `INSERT INTO user_modules (user_id, module_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [data.user_id, data.module_id],
    );

    const [rows] = await pool.execute(
      `SELECT * FROM user_modules WHERE user_id = ? AND module_id = ?`,
      [data.user_id, data.module_id],
    );

    const modules = rows as UserModule[];
    return modules[0] as UserModule;
  }

  // Get all extra modules a user has access to
  async getUserModules(userId: number): Promise<UserModule[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM user_modules WHERE user_id = ?`,
      [userId],
    );
    return rows as UserModule[];
  }

  // Check if a user has extra access to a module
  async hasUserModule(userId: number, moduleId: number): Promise<boolean> {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM user_modules WHERE user_id = ? AND module_id = ?`,
      [userId, moduleId],
    );
    const result = rows as { count: number }[];
    return (result[0]?.count ?? 0) > 0;
  }

  // Remove extra module access from a user
  async removeUserModule(userId: number, moduleId: number): Promise<void> {
    await pool.execute(
      `DELETE FROM user_modules WHERE user_id = ? AND module_id = ?`,
      [userId, moduleId],
    );
  }

  // Remove all extra module access from a user
  async removeAllUserModules(userId: number): Promise<void> {
    await pool.execute(`DELETE FROM user_modules WHERE user_id = ?`, [userId]);
  }

  // ==================== COMBINED PERMISSIONS (For Auth) ====================

  // Get all modules a user has access to (role + user modules)
  async getUserModulesWithModuleNames(
    userId: number,
    roleId: number | null,
  ): Promise<ModuleAccessDTO[]> {
    // Get all active modules
    const [modules] = await pool.execute(
      `SELECT id, name, parent_id FROM modules WHERE active = TRUE`,
    );

    // Get role modules if role exists
    let roleModules: RoleModule[] = [];
    if (roleId) {
      roleModules = await this.getRoleModules(roleId);
    }

    // Get user extra modules
    const userModules = await this.getUserModules(userId);

    // Create sets for quick lookup
    const roleModuleIds = new Set(roleModules.map((rm) => rm.module_id));
    const userModuleIds = new Set(userModules.map((um) => um.module_id));

    // Combine permissions
    const result: ModuleAccessDTO[] = [];
    for (const module of modules as {
      id: number;
      name: string;
      parent_id: number | null;
    }[]) {
      const hasRoleAccess = roleModuleIds.has(module.id);
      const hasUserAccess = userModuleIds.has(module.id);

      let source: "role" | "user" | "combined" = "role";
      let hasAccess = hasRoleAccess;

      if (hasRoleAccess && hasUserAccess) {
        source = "combined";
      } else if (hasUserAccess) {
        source = "user";
        hasAccess = true;
      }

      result.push({
        module_id: module.id,
        module_name: module.name,
        parent_id: module.parent_id,
        has_access: hasAccess,
        source,
      });
    }

    return result;
  }

  // Check if user has access to a specific module
  async hasModuleAccess(
    userId: number,
    roleId: number | null,
    moduleName: string,
  ): Promise<boolean> {
    // Get module id
    const [modules] = await pool.execute(
      `SELECT id FROM modules WHERE name = ? AND active = TRUE`,
      [moduleName],
    );
    const moduleRows = modules as { id: number }[];
    if (moduleRows.length === 0) {
      return false;
    }
    const moduleId = moduleRows[0]?.id;
    if (!moduleId) {
      return false;
    }

    // Check role access
    let hasRoleAccess = false;
    if (roleId) {
      hasRoleAccess = await this.hasRoleModule(roleId, moduleId);
    }

    // Check user extra access
    const hasUserAccess = await this.hasUserModule(userId, moduleId);

    return hasRoleAccess || hasUserAccess;
  }

  // ==================== LEGACY METHODS (For backwards compatibility) ====================
  // These methods are kept for backwards compatibility but use the simplified schema

  async createPermissionMaster(
    data: CreatePermissionMasterDTO,
  ): Promise<PermissionMaster> {
    // No-op - permissions table no longer exists
    throw new Error("Permission master is no longer used");
  }

  async findAllPermissionMasters(
    _activeOnly = false,
  ): Promise<PermissionMaster[]> {
    // No-op - permissions table no longer exists
    return [];
  }

  async findPermissionMasterById(
    _id: number,
  ): Promise<PermissionMaster | null> {
    return null;
  }

  async findPermissionMasterByCode(
    _code: string,
  ): Promise<PermissionMaster | null> {
    return null;
  }

  async updatePermissionMaster(
    _id: number,
    _data: Partial<CreatePermissionMasterDTO>,
  ): Promise<PermissionMaster | null> {
    return null;
  }

  async deletePermissionMaster(_id: number): Promise<void> {
    // No-op
  }

  // Legacy role permissions methods
  async createRolePermission(data: CreateRoleModuleDTO): Promise<any> {
    return this.addRoleModule(data);
  }

  async findRolePermissionsByRoleId(
    roleId: number,
    _activeOnly = false,
  ): Promise<any[]> {
    return this.getRoleModules(roleId);
  }

  async findRolePermission(
    roleId: number,
    moduleId: number,
  ): Promise<any | null> {
    const hasAccess = await this.hasRoleModule(roleId, moduleId);
    if (!hasAccess) return null;
    return { role_id: roleId, module_id: moduleId };
  }

  async updateRolePermission(
    _roleId: number,
    _moduleId: number,
    _data: any,
  ): Promise<any | null> {
    return null;
  }

  async deleteRolePermission(roleId: number, moduleId: number): Promise<void> {
    await this.removeRoleModule(roleId, moduleId);
  }

  async deleteAllRolePermissions(roleId: number): Promise<void> {
    await this.removeAllRoleModules(roleId);
  }

  // Legacy user permissions methods
  async createUserPermission(data: CreateUserModuleDTO): Promise<any> {
    return this.addUserModule(data);
  }

  async findUserPermissionsByUserId(
    userId: number,
    _activeOnly = false,
  ): Promise<any[]> {
    return this.getUserModules(userId);
  }

  async findUserPermission(
    userId: number,
    moduleId: number,
  ): Promise<any | null> {
    const hasAccess = await this.hasUserModule(userId, moduleId);
    if (!hasAccess) return null;
    return { user_id: userId, module_id: moduleId };
  }

  async updateUserPermission(
    _userId: number,
    _moduleId: number,
    _data: any,
  ): Promise<any | null> {
    return null;
  }

  async deleteUserPermission(userId: number, moduleId: number): Promise<void> {
    await this.removeUserModule(userId, moduleId);
  }

  async deleteAllUserPermissions(userId: number): Promise<void> {
    await this.removeAllUserModules(userId);
  }

  async getUserPermissionsWithModuleNames(
    userId: number,
    roleId: number | null,
  ): Promise<PermissionResponseDTO[]> {
    const modules = await this.getUserModulesWithModuleNames(userId, roleId);

    return modules.map((m) => ({
      module_id: m.module_id,
      module_name: m.module_name,
      can_read: m.has_access,
      can_write: m.has_access,
      can_delete: m.has_access,
      can_update: m.has_access,
      active: m.has_access,
      source: m.source,
    }));
  }

  async hasPermission(
    userId: number,
    moduleName: string,
    _permissionType: "read" | "write" | "delete" | "update",
  ): Promise<boolean> {
    // Get user role
    const [users] = await pool.execute(
      `SELECT role_id FROM users WHERE id = ?`,
      [userId],
    );
    const userRows = users as { role_id: number | null }[];
    const roleId = userRows[0]?.role_id ?? null;

    return this.hasModuleAccess(userId, roleId, moduleName);
  }
}

export default new PermissionRepository();
