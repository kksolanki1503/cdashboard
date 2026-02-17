import {
  roleRepository,
  moduleRepository,
  permissionRepository,
  userRepository,
} from "../repository/index.js";
import {
  type Role,
  type Module,
  type CreateRoleDTO,
  type CreateModuleDTO,
  type CreateRolePermissionDTO,
  type CreateUserPermissionDTO,
  type UserPermissionsResponseDTO,
  type PermissionResponseDTO,
} from "../types/index.js";
import { NotFoundError, ConflictError } from "../error/index.js";

export class RBACService {
  // Role Management
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

    // Delete all role permissions first
    await permissionRepository.deleteAllRolePermissions(id);
    await roleRepository.delete(id);
  }

  // Module Management
  async createModule(data: CreateModuleDTO): Promise<Module> {
    const existingModule = await moduleRepository.findByName(data.name);
    if (existingModule) {
      throw new ConflictError("Module with this name already exists");
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

    const updatedModule = await moduleRepository.update(id, data);
    return updatedModule as Module;
  }

  async deleteModule(id: number): Promise<void> {
    const module = await moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundError("Module not found");
    }

    await moduleRepository.delete(id);
  }

  // Role Permission Management
  async setRolePermission(data: CreateRolePermissionDTO): Promise<void> {
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

    await permissionRepository.createRolePermission(data);
  }

  async getRolePermissions(roleId: number): Promise<PermissionResponseDTO[]> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const permissions =
      await permissionRepository.findRolePermissionsByRoleId(roleId);
    const modules = await moduleRepository.findAll();

    return modules.map((module) => {
      const perm = permissions.find((p) => p.module_id === module.id);
      return {
        module_id: module.id,
        module_name: module.name,
        can_read: perm?.can_read ?? false,
        can_write: perm?.can_write ?? false,
        can_delete: perm?.can_delete ?? false,
        can_update: perm?.can_update ?? false,
        source: "role" as const,
      };
    });
  }

  async removeRolePermission(roleId: number, moduleId: number): Promise<void> {
    await permissionRepository.deleteRolePermission(roleId, moduleId);
  }

  // User Permission Management
  async setUserPermission(data: CreateUserPermissionDTO): Promise<void> {
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

    await permissionRepository.createUserPermission(data);
  }

  async getUserPermissions(
    userId: number,
  ): Promise<UserPermissionsResponseDTO> {
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

    const permissions =
      await permissionRepository.getUserPermissionsWithModuleNames(
        userId,
        user.role_id,
      );

    return {
      role,
      permissions,
    };
  }

  async removeUserPermission(userId: number, moduleId: number): Promise<void> {
    await permissionRepository.deleteUserPermission(userId, moduleId);
  }

  // Assign role to user
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    // Update user's role_id
    await pool.execute(`UPDATE users SET role_id = ? WHERE id = ?`, [
      roleId,
      userId,
    ]);
  }

  // Remove role from user
  async removeRoleFromUser(userId: number): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await pool.execute(`UPDATE users SET role_id = NULL WHERE id = ?`, [
      userId,
    ]);
  }

  // Check permission
  async checkPermission(
    userId: number,
    moduleName: string,
    permissionType: "read" | "write" | "delete" | "update",
  ): Promise<boolean> {
    return permissionRepository.hasPermission(
      userId,
      moduleName,
      permissionType,
    );
  }
}

// Import pool for direct queries
import { pool } from "../config/index.js";

export default new RBACService();
