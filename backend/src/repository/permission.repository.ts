import { pool } from "../config/index.js";
import {
  RolePermission,
  UserPermission,
  PermissionMaster,
  CreateRolePermissionDTO,
  CreateUserPermissionDTO,
  UpdateRolePermissionDTO,
  UpdateUserPermissionDTO,
  CreatePermissionMasterDTO,
  PermissionResponseDTO,
} from "../types/index.js";

export class PermissionRepository {
  // Permission Master
  async createPermissionMaster(
    data: CreatePermissionMasterDTO,
  ): Promise<PermissionMaster> {
    const [result] = await pool.execute(
      `INSERT INTO permissions (name, code, description, active)
       VALUES (?, ?, ?, ?)`,
      [data.name, data.code, data.description ?? null, data.active ?? true],
    );

    const insertResult = result as { insertId: number };
    const [rows] = await pool.execute(
      `SELECT * FROM permissions WHERE id = ?`,
      [insertResult.insertId],
    );

    const permissions = rows as PermissionMaster[];
    return permissions[0] as PermissionMaster;
  }

  async findAllPermissionMasters(
    activeOnly = false,
  ): Promise<PermissionMaster[]> {
    const query = activeOnly
      ? `SELECT * FROM permissions WHERE active = TRUE ORDER BY name`
      : `SELECT * FROM permissions ORDER BY name`;

    const [rows] = await pool.execute(query);
    return rows as PermissionMaster[];
  }

  async findPermissionMasterById(id: number): Promise<PermissionMaster | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM permissions WHERE id = ?`,
      [id],
    );

    const permissions = rows as PermissionMaster[];
    return permissions.length > 0 ? (permissions[0] ?? null) : null;
  }

  async findPermissionMasterByCode(
    code: string,
  ): Promise<PermissionMaster | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM permissions WHERE code = ?`,
      [code],
    );

    const permissions = rows as PermissionMaster[];
    return permissions.length > 0 ? (permissions[0] ?? null) : null;
  }

  async updatePermissionMaster(
    id: number,
    data: Partial<CreatePermissionMasterDTO>,
  ): Promise<PermissionMaster | null> {
    const fields: string[] = [];
    const values: (string | boolean | null)[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.code !== undefined) {
      fields.push("code = ?");
      values.push(data.code);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.active !== undefined) {
      fields.push("active = ?");
      values.push(data.active);
    }

    if (fields.length === 0) {
      return this.findPermissionMasterById(id);
    }

    values.push(id.toString());
    await pool.execute(
      `UPDATE permissions SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findPermissionMasterById(id);
  }

  async deletePermissionMaster(id: number): Promise<void> {
    await pool.execute(`DELETE FROM permissions WHERE id = ?`, [id]);
  }

  // Role Permissions
  async createRolePermission(
    data: CreateRolePermissionDTO,
  ): Promise<RolePermission> {
    await pool.execute(
      `INSERT INTO role_permissions (role_id, module_id, can_read, can_write, can_delete, can_update, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         can_read = VALUES(can_read),
         can_write = VALUES(can_write),
         can_delete = VALUES(can_delete),
         can_update = VALUES(can_update),
         active = VALUES(active)`,
      [
        data.role_id,
        data.module_id,
        data.can_read ?? false,
        data.can_write ?? false,
        data.can_delete ?? false,
        data.can_update ?? false,
        data.active ?? true,
      ],
    );

    const [rows] = await pool.execute(
      `SELECT * FROM role_permissions WHERE role_id = ? AND module_id = ?`,
      [data.role_id, data.module_id],
    );

    const permissions = rows as RolePermission[];
    return permissions[0] as RolePermission;
  }

  async findRolePermissionsByRoleId(
    roleId: number,
    activeOnly = false,
  ): Promise<RolePermission[]> {
    const query = activeOnly
      ? `SELECT * FROM role_permissions WHERE role_id = ? AND active = TRUE`
      : `SELECT * FROM role_permissions WHERE role_id = ?`;

    const [rows] = await pool.execute(query, [roleId]);
    return rows as RolePermission[];
  }

  async findRolePermission(
    roleId: number,
    moduleId: number,
  ): Promise<RolePermission | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM role_permissions WHERE role_id = ? AND module_id = ?`,
      [roleId, moduleId],
    );

    const permissions = rows as RolePermission[];
    return permissions.length > 0 ? (permissions[0] ?? null) : null;
  }

  async updateRolePermission(
    roleId: number,
    moduleId: number,
    data: UpdateRolePermissionDTO,
  ): Promise<RolePermission | null> {
    const fields: string[] = [];
    const values: (boolean | number)[] = [];

    if (data.can_read !== undefined) {
      fields.push("can_read = ?");
      values.push(data.can_read);
    }
    if (data.can_write !== undefined) {
      fields.push("can_write = ?");
      values.push(data.can_write);
    }
    if (data.can_delete !== undefined) {
      fields.push("can_delete = ?");
      values.push(data.can_delete);
    }
    if (data.can_update !== undefined) {
      fields.push("can_update = ?");
      values.push(data.can_update);
    }
    if (data.active !== undefined) {
      fields.push("active = ?");
      values.push(data.active);
    }

    if (fields.length === 0) {
      return this.findRolePermission(roleId, moduleId);
    }

    values.push(roleId, moduleId);
    await pool.execute(
      `UPDATE role_permissions SET ${fields.join(", ")} WHERE role_id = ? AND module_id = ?`,
      values,
    );

    return this.findRolePermission(roleId, moduleId);
  }

  async deleteRolePermission(roleId: number, moduleId: number): Promise<void> {
    await pool.execute(
      `DELETE FROM role_permissions WHERE role_id = ? AND module_id = ?`,
      [roleId, moduleId],
    );
  }

  async deleteAllRolePermissions(roleId: number): Promise<void> {
    await pool.execute(`DELETE FROM role_permissions WHERE role_id = ?`, [
      roleId,
    ]);
  }

  // User Permissions
  async createUserPermission(
    data: CreateUserPermissionDTO,
  ): Promise<UserPermission> {
    await pool.execute(
      `INSERT INTO user_permissions (user_id, module_id, can_read, can_write, can_delete, can_update, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         can_read = VALUES(can_read),
         can_write = VALUES(can_write),
         can_delete = VALUES(can_delete),
         can_update = VALUES(can_update),
         active = VALUES(active)`,
      [
        data.user_id,
        data.module_id,
        data.can_read ?? false,
        data.can_write ?? false,
        data.can_delete ?? false,
        data.can_update ?? false,
        data.active ?? true,
      ],
    );

    const [rows] = await pool.execute(
      `SELECT * FROM user_permissions WHERE user_id = ? AND module_id = ?`,
      [data.user_id, data.module_id],
    );

    const permissions = rows as UserPermission[];
    return permissions[0] as UserPermission;
  }

  async findUserPermissionsByUserId(
    userId: number,
    activeOnly = false,
  ): Promise<UserPermission[]> {
    const query = activeOnly
      ? `SELECT * FROM user_permissions WHERE user_id = ? AND active = TRUE`
      : `SELECT * FROM user_permissions WHERE user_id = ?`;

    const [rows] = await pool.execute(query, [userId]);
    return rows as UserPermission[];
  }

  async findUserPermission(
    userId: number,
    moduleId: number,
  ): Promise<UserPermission | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM user_permissions WHERE user_id = ? AND module_id = ?`,
      [userId, moduleId],
    );

    const permissions = rows as UserPermission[];
    return permissions.length > 0 ? (permissions[0] ?? null) : null;
  }

  async updateUserPermission(
    userId: number,
    moduleId: number,
    data: UpdateUserPermissionDTO,
  ): Promise<UserPermission | null> {
    const fields: string[] = [];
    const values: (boolean | number)[] = [];

    if (data.can_read !== undefined) {
      fields.push("can_read = ?");
      values.push(data.can_read);
    }
    if (data.can_write !== undefined) {
      fields.push("can_write = ?");
      values.push(data.can_write);
    }
    if (data.can_delete !== undefined) {
      fields.push("can_delete = ?");
      values.push(data.can_delete);
    }
    if (data.can_update !== undefined) {
      fields.push("can_update = ?");
      values.push(data.can_update);
    }
    if (data.active !== undefined) {
      fields.push("active = ?");
      values.push(data.active);
    }

    if (fields.length === 0) {
      return this.findUserPermission(userId, moduleId);
    }

    values.push(userId, moduleId);
    await pool.execute(
      `UPDATE user_permissions SET ${fields.join(", ")} WHERE user_id = ? AND module_id = ?`,
      values,
    );

    return this.findUserPermission(userId, moduleId);
  }

  async deleteUserPermission(userId: number, moduleId: number): Promise<void> {
    await pool.execute(
      `DELETE FROM user_permissions WHERE user_id = ? AND module_id = ?`,
      [userId, moduleId],
    );
  }

  async deleteAllUserPermissions(userId: number): Promise<void> {
    await pool.execute(`DELETE FROM user_permissions WHERE user_id = ?`, [
      userId,
    ]);
  }

  // Combined permissions for a user (role + user permissions)
  async getUserPermissionsWithModuleNames(
    userId: number,
    roleId: number | null,
  ): Promise<PermissionResponseDTO[]> {
    // Get all active modules
    const [modules] = await pool.execute(
      `SELECT id, name FROM modules WHERE active = TRUE`,
    );

    // Get role permissions if role exists (active only)
    let rolePermissions: RolePermission[] = [];
    if (roleId) {
      rolePermissions = await this.findRolePermissionsByRoleId(roleId, true);
    }

    // Get user permissions (active only)
    const userPermissions = await this.findUserPermissionsByUserId(
      userId,
      true,
    );

    // Create a map for quick lookup
    const rolePermMap = new Map<number, RolePermission>();
    for (const rp of rolePermissions) {
      rolePermMap.set(rp.module_id, rp);
    }

    const userPermMap = new Map<number, UserPermission>();
    for (const up of userPermissions) {
      userPermMap.set(up.module_id, up);
    }

    // Combine permissions
    const result: PermissionResponseDTO[] = [];
    for (const module of modules as { id: number; name: string }[]) {
      const rolePerm = rolePermMap.get(module.id);
      const userPerm = userPermMap.get(module.id);

      let canRead = false;
      let canWrite = false;
      let canDelete = false;
      let canUpdate = false;
      let active = false;
      let source: "role" | "user" | "combined" = "role";

      if (rolePerm && userPerm) {
        canRead = rolePerm.can_read || userPerm.can_read;
        canWrite = rolePerm.can_write || userPerm.can_write;
        canDelete = rolePerm.can_delete || userPerm.can_delete;
        canUpdate = rolePerm.can_update || userPerm.can_update;
        active = rolePerm.active || userPerm.active;
        source = "combined";
      } else if (userPerm) {
        canRead = userPerm.can_read;
        canWrite = userPerm.can_write;
        canDelete = userPerm.can_delete;
        canUpdate = userPerm.can_update;
        active = userPerm.active;
        source = "user";
      } else if (rolePerm) {
        canRead = rolePerm.can_read;
        canWrite = rolePerm.can_write;
        canDelete = rolePerm.can_delete;
        canUpdate = rolePerm.can_update;
        active = rolePerm.active;
        source = "role";
      }

      result.push({
        module_id: module.id,
        module_name: module.name,
        can_read: canRead,
        can_write: canWrite,
        can_delete: canDelete,
        can_update: canUpdate,
        active: active,
        source,
      });
    }

    return result;
  }

  // Check if user has specific permission for a module
  async hasPermission(
    userId: number,
    moduleName: string,
    permissionType: "read" | "write" | "delete" | "update",
  ): Promise<boolean> {
    const [rows] = await pool.execute(
      `SELECT 
        COALESCE(up.can_${permissionType}, rp.can_${permissionType}, FALSE) as has_permission
       FROM users u
       LEFT JOIN user_permissions up ON u.id = up.user_id AND up.active = TRUE
       LEFT JOIN modules m ON up.module_id = m.id AND m.active = TRUE
       LEFT JOIN role_permissions rp ON u.role_id = rp.role_id AND rp.module_id = m.id AND rp.active = TRUE
       WHERE u.id = ? AND m.name = ?`,
      [userId, moduleName],
    );

    const results = rows as { has_permission: boolean }[];
    return results.length > 0 && results[0]?.has_permission === true;
  }
}

export default new PermissionRepository();
