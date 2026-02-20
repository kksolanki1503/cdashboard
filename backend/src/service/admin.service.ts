import {
  roleRepository,
  moduleRepository,
  permissionRepository,
  userRepository,
} from "../repository/index.js";
import {
  type Role,
  type Module,
  type User,
  type CreateRoleDTO,
  type CreateModuleDTO,
  type CreateUserDTO,
  // Simplified permission types
  type CreateRoleModuleDTO,
  type CreateUserModuleDTO,
  type UserModulesResponseDTO,
  type ModuleAccessDTO,
  type UserResponseDTO,
  type ModuleWithChildrenDTO,
  toUserResponseDTO,
} from "../types/index.js";
import { NotFoundError, ConflictError } from "../error/index.js";
import { pool } from "../config/index.js";
import { hashPassword } from "../util/index.js";

export interface AdminUserResponseDTO extends UserResponseDTO {
  role?: {
    id: number;
    name: string;
  } | null;
}

export interface DashboardStatsDTO {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalRoles: number;
  totalModules: number;
  recentUsers: UserResponseDTO[];
}

export interface PermissionsMatrixDTO {
  roles: Array<{ id: number; name: string }>;
  modules: Array<{ id: number; name: string }>;
  permissions: Array<{
    role_id: number;
    module_id: number;
    can_read: boolean;
    can_write: boolean;
    can_delete: boolean;
    can_update: boolean;
  }>;
}

export class AdminService {
  // ==================== USER MANAGEMENT ====================

  async getAllUsers(): Promise<AdminUserResponseDTO[]> {
    const users = await userRepository.findAll();

    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        let role = null;
        if (user.role_id) {
          const roleData = await roleRepository.findById(user.role_id);
          if (roleData) {
            role = {
              id: roleData.id,
              name: roleData.name,
            };
          }
        }
        return {
          ...toUserResponseDTO(user),
          role,
        };
      }),
    );

    return usersWithRoles;
  }

  async getUserById(id: number): Promise<AdminUserResponseDTO> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    let role = null;
    if (user.role_id) {
      const roleData = await roleRepository.findById(user.role_id);
      if (roleData) {
        role = {
          id: roleData.id,
          name: roleData.name,
        };
      }
    }

    return {
      ...toUserResponseDTO(user),
      role,
    };
  }

  async createUser(data: CreateUserDTO): Promise<AdminUserResponseDTO> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const createData: CreateUserDTO = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    };
    if (data.role_id !== undefined) {
      createData.role_id = data.role_id;
    }
    const user = await userRepository.create(createData);

    return this.getUserById(user.id);
  }

  async updateUser(
    id: number,
    data: Partial<Omit<CreateUserDTO, "password">>,
  ): Promise<AdminUserResponseDTO> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== user.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }
    }

    // Update user
    await pool.execute(
      `UPDATE users SET name = ?, email = ?, role_id = ? WHERE id = ?`,
      [
        data.name ?? user.name,
        data.email ?? user.email,
        data.role_id ?? user.role_id,
        id,
      ],
    );

    return this.getUserById(id);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Delete user's refresh tokens
    await pool.execute(`DELETE FROM refresh_tokens WHERE user_id = ?`, [id]);

    // Delete user's permissions
    await pool.execute(`DELETE FROM user_permissions WHERE user_id = ?`, [id]);

    // Delete user
    await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);
  }

  async approveUser(id: number): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await userRepository.updateApproved(id, true);
  }

  async deactivateUser(id: number): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await userRepository.updateActive(id, false);
  }

  async activateUser(id: number): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await userRepository.updateActive(id, true);
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    await userRepository.updateRole(userId, roleId);
  }

  async removeRoleFromUser(userId: number): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await userRepository.updateRole(userId, null);
  }

  async getPendingUsers(): Promise<AdminUserResponseDTO[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE approved = false ORDER BY created_at DESC`,
    );

    const users = rows as User[];

    return Promise.all(
      users.map(async (user) => {
        let role = null;
        if (user.role_id) {
          const roleData = await roleRepository.findById(user.role_id);
          if (roleData) {
            role = {
              id: roleData.id,
              name: roleData.name,
            };
          }
        }
        return {
          ...toUserResponseDTO(user),
          role,
        };
      }),
    );
  }

  // ==================== ROLE MANAGEMENT ====================

  async createRole(data: CreateRoleDTO): Promise<Role> {
    const existingRole = await roleRepository.findByName(data.name);
    if (existingRole) {
      throw new ConflictError("Role with this name already exists");
    }
    return roleRepository.create(data);
  }

  async getRoleById(id: number): Promise<Role> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return roleRepository.findAll();
  }

  async updateRole(id: number, data: Partial<CreateRoleDTO>): Promise<Role> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    if (data.name && data.name !== role.name) {
      const existingRole = await roleRepository.findByName(data.name);
      if (existingRole) {
        throw new ConflictError("Role with this name already exists");
      }
    }

    const updatedRole = await roleRepository.update(id, data);
    return updatedRole as Role;
  }

  async deleteRole(id: number): Promise<void> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    // Check if any users have this role
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM users WHERE role_id = ?`,
      [id],
    );
    const count = (rows as [{ count: number }])[0].count;

    if (count > 0) {
      throw new ConflictError(
        "Cannot delete role. Users are assigned to this role.",
      );
    }

    // Delete all role permissions first
    await permissionRepository.deleteAllRolePermissions(id);
    await roleRepository.delete(id);
  }

  async getUsersByRole(roleId: number): Promise<AdminUserResponseDTO[]> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE role_id = ? ORDER BY name ASC`,
      [roleId],
    );

    const users = rows as User[];

    return users.map((user) => ({
      ...toUserResponseDTO(user),
      role: {
        id: role.id,
        name: role.name,
      },
    }));
  }

  // ==================== MODULE MANAGEMENT ====================

  async createModule(data: CreateModuleDTO): Promise<Module> {
    // Check for duplicate name - findByName returns first match
    const existingModule = await moduleRepository.findByName(data.name);
    if (existingModule) {
      // If found by name, check if it's under the same parent
      // Treat both null parent_id as same (root level)
      const dataParentId = data.parent_id ?? null;
      if (dataParentId === existingModule.parent_id) {
        throw new ConflictError(
          "Module with this name already exists under this parent",
        );
      }
    }

    // Validate parent_id if provided
    if (data.parent_id) {
      const parentModule = await moduleRepository.findById(data.parent_id);
      if (!parentModule) {
        throw new NotFoundError("Parent module not found");
      }
    }

    return moduleRepository.create(data);
  }

  async getModuleById(id: number): Promise<Module> {
    const module = await moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundError("Module not found");
    }
    return module;
  }

  async getAllModules(): Promise<Module[]> {
    return moduleRepository.findAll();
  }

  async getModuleTree(): Promise<ModuleWithChildrenDTO[]> {
    return moduleRepository.getModuleTree();
  }

  async getRootModules(): Promise<Module[]> {
    return moduleRepository.findRootModules();
  }

  async getSubModules(parentId: number): Promise<Module[]> {
    return moduleRepository.findSubModules(parentId);
  }

  async updateModule(
    id: number,
    data: Partial<CreateModuleDTO>,
  ): Promise<Module> {
    const module = await moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundError("Module not found");
    }

    if (data.name && data.name !== module.name) {
      const existingModule = await moduleRepository.findByName(data.name);
      if (existingModule) {
        throw new ConflictError("Module with this name already exists");
      }
    }

    // Validate parent_id if provided
    if (data.parent_id !== undefined && data.parent_id !== null) {
      // Cannot set parent_id to self
      if (data.parent_id === id) {
        throw new ConflictError("Module cannot be its own parent");
      }

      const parentModule = await moduleRepository.findById(data.parent_id);
      if (!parentModule) {
        throw new NotFoundError("Parent module not found");
      }

      // Check for circular reference
      let currentParent = parentModule;
      while (currentParent.parent_id) {
        if (currentParent.parent_id === id) {
          throw new ConflictError(
            "Circular reference detected in module hierarchy",
          );
        }
        const nextParent = await moduleRepository.findById(
          currentParent.parent_id,
        );
        if (!nextParent) break;
        currentParent = nextParent;
      }
    }

    const updatedModule = await moduleRepository.update(id, data);
    return updatedModule as Module;
  }

  async deleteModule(id: number): Promise<void> {
    const module = await moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundError("Module not found");
    }

    // Check if module has sub-modules
    const subModules = await moduleRepository.findSubModules(id);
    if (subModules.length > 0) {
      throw new ConflictError(
        "Cannot delete module with sub-modules. Delete or reassign sub-modules first.",
      );
    }

    // Delete all permissions for this module
    await pool.execute(`DELETE FROM role_permissions WHERE module_id = ?`, [
      id,
    ]);
    await pool.execute(`DELETE FROM user_permissions WHERE module_id = ?`, [
      id,
    ]);

    await moduleRepository.delete(id);
  }

  // ==================== PERMISSION MANAGEMENT (Simplified) ====================

  async setRolePermission(data: CreateRoleModuleDTO): Promise<void> {
    // Verify role exists
    const role = await roleRepository.findById(data.role_id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    // Verify module exists
    const module = await moduleRepository.findById(data.module_id);
    if (!module) {
      throw new NotFoundError("Module not found");
    }

    await permissionRepository.addRoleModule(data);
  }

  async getRolePermissions(roleId: number): Promise<ModuleAccessDTO[]> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    // Get all modules and mark which ones this role has access to
    const allModules = await moduleRepository.findAll();
    const roleModules = await permissionRepository.getRoleModules(roleId);
    const roleModuleIds = new Set(roleModules.map((rm) => rm.module_id));

    return allModules.map((module) => ({
      module_id: module.id,
      module_name: module.name,
      parent_id: module.parent_id,
      has_access: roleModuleIds.has(module.id),
      source: "role" as const,
    }));
  }

  async setUserPermission(data: CreateUserModuleDTO): Promise<void> {
    // Verify user exists
    const user = await userRepository.findById(data.user_id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify module exists
    const module = await moduleRepository.findById(data.module_id);
    if (!module) {
      throw new NotFoundError("Module not found");
    }

    await permissionRepository.addUserModule(data);
  }

  async getUserPermissions(userId: number): Promise<UserModulesResponseDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    let role = null;
    if (user.role_id) {
      const roleData = await roleRepository.findById(user.role_id);
      if (roleData) {
        role = {
          id: roleData.id,
          name: roleData.name,
        };
      }
    }

    const modules = await permissionRepository.getUserModulesWithModuleNames(
      userId,
      user.role_id,
    );

    return {
      role,
      modules,
    };
  }

  async getPermissionsMatrix(): Promise<PermissionsMatrixDTO> {
    const roles = await roleRepository.findAll();
    const modules = await moduleRepository.findAll();

    const [permRows] = await pool.execute(`
      SELECT role_id, module_id, can_read, can_write, can_delete, can_update 
      FROM role_permissions
    `);

    return {
      roles: roles.map((r) => ({ id: r.id, name: r.name })),
      modules: modules.map((m) => ({ id: m.id, name: m.name })),
      permissions: permRows as Array<{
        role_id: number;
        module_id: number;
        can_read: boolean;
        can_write: boolean;
        can_delete: boolean;
        can_update: boolean;
      }>,
    };
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats(): Promise<DashboardStatsDTO> {
    // Get total users count
    const [totalUsersRows] = await pool.execute(
      `SELECT COUNT(*) as count FROM users`,
    );
    const totalUsers = (totalUsersRows as [{ count: number }])[0].count;

    // Get active users count
    const [activeUsersRows] = await pool.execute(
      `SELECT COUNT(*) as count FROM users WHERE active = true AND approved = true`,
    );
    const activeUsers = (activeUsersRows as [{ count: number }])[0].count;

    // Get pending users count
    const [pendingUsersRows] = await pool.execute(
      `SELECT COUNT(*) as count FROM users WHERE approved = false`,
    );
    const pendingUsers = (pendingUsersRows as [{ count: number }])[0].count;

    // Get total roles count
    const [totalRolesRows] = await pool.execute(
      `SELECT COUNT(*) as count FROM roles`,
    );
    const totalRoles = (totalRolesRows as [{ count: number }])[0].count;

    // Get total modules count
    const [totalModulesRows] = await pool.execute(
      `SELECT COUNT(*) as count FROM modules`,
    );
    const totalModules = (totalModulesRows as [{ count: number }])[0].count;

    // Get recent users (last 5)
    const [recentUsersRows] = await pool.execute(
      `SELECT id, name, email, approved, active, role_id, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT 5`,
    );
    const recentUsers = (recentUsersRows as User[]).map(toUserResponseDTO);

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      totalRoles,
      totalModules,
      recentUsers,
    };
  }
}

export default new AdminService();
