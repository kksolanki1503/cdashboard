import api from "@/lib/axios";

// ==================== TYPES ====================

export interface User {
  id: number;
  name: string;
  email: string;
  approved: boolean;
  active: boolean;
  role_id: number | null;
  created_at: string;
  updated_at: string;
  role?: {
    id: number;
    name: string;
  } | null;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleWithChildren extends Module {
  children: ModuleWithChildren[];
}

export interface Permission {
  module_id: number;
  module_name: string;
  has_access: boolean;
  source: "role" | "user" | "combined";
}

export interface PermissionsMatrix {
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

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalRoles: number;
  totalModules: number;
  recentUsers: User[];
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role_id?: number;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role_id?: number;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
}

export interface CreateModuleDTO {
  name: string;
  description?: string;
  parent_id?: number | null;
}

export interface UpdateModuleDTO {
  name?: string;
  description?: string;
  parent_id?: number | null;
}

export interface SetRolePermissionDTO {
  role_id: number;
  module_id: number;
}

export interface SetUserPermissionDTO {
  user_id: number;
  module_id: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ==================== ADMIN SERVICE ====================

const adminService = {
  // ==================== DASHBOARD STATS ====================
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>(
      "/api/v1/admin/dashboard/stats",
    );
    return response.data;
  },

  // ==================== USER MANAGEMENT ====================
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>("/api/v1/admin/users");
    return response.data;
  },

  getPendingUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>(
      "/api/v1/admin/users/pending",
    );
    return response.data;
  },

  getUserById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>(
      `/api/v1/admin/users/${id}`,
    );
    return response.data;
  },

  createUser: async (data: CreateUserDTO): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>(
      "/api/v1/admin/users",
      data,
    );
    return response.data;
  },

  updateUser: async (
    id: number,
    data: UpdateUserDTO,
  ): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(
      `/api/v1/admin/users/${id}`,
      data,
    );
    return response.data;
  },

  deleteUser: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      `/api/v1/admin/users/${id}`,
    );
    return response.data;
  },

  approveUser: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/api/v1/admin/users/${id}/approve`,
    );
    return response.data;
  },

  activateUser: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/api/v1/admin/users/${id}/activate`,
    );
    return response.data;
  },

  deactivateUser: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/api/v1/admin/users/${id}/deactivate`,
    );
    return response.data;
  },

  assignRole: async (
    userId: number,
    roleId: number,
  ): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/api/v1/admin/users/${userId}/role`,
      { role_id: roleId },
    );
    return response.data;
  },

  removeRole: async (userId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      `/api/v1/admin/users/${userId}/role`,
    );
    return response.data;
  },

  // ==================== ROLE MANAGEMENT ====================
  getAllRoles: async (): Promise<ApiResponse<Role[]>> => {
    const response = await api.get<ApiResponse<Role[]>>("/api/v1/admin/roles");
    return response.data;
  },

  getRoleById: async (id: number): Promise<ApiResponse<Role>> => {
    const response = await api.get<ApiResponse<Role>>(
      `/api/v1/admin/roles/${id}`,
    );
    return response.data;
  },

  createRole: async (data: CreateRoleDTO): Promise<ApiResponse<Role>> => {
    const response = await api.post<ApiResponse<Role>>(
      "/api/v1/admin/roles",
      data,
    );
    return response.data;
  },

  updateRole: async (
    id: number,
    data: UpdateRoleDTO,
  ): Promise<ApiResponse<Role>> => {
    const response = await api.put<ApiResponse<Role>>(
      `/api/v1/admin/roles/${id}`,
      data,
    );
    return response.data;
  },

  deleteRole: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      `/api/v1/admin/roles/${id}`,
    );
    return response.data;
  },

  getUsersByRole: async (roleId: number): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>(
      `/api/v1/admin/roles/${roleId}/users`,
    );
    return response.data;
  },

  // ==================== MODULE MANAGEMENT ====================
  getAllModules: async (): Promise<ApiResponse<Module[]>> => {
    const response = await api.get<ApiResponse<Module[]>>(
      "/api/v1/admin/modules",
    );
    return response.data;
  },

  getModuleTree: async (): Promise<ApiResponse<ModuleWithChildren[]>> => {
    const response = await api.get<ApiResponse<ModuleWithChildren[]>>(
      "/api/v1/admin/modules/tree",
    );
    return response.data;
  },

  getModuleById: async (id: number): Promise<ApiResponse<Module>> => {
    const response = await api.get<ApiResponse<Module>>(
      `/api/v1/admin/modules/${id}`,
    );
    return response.data;
  },

  getSubModules: async (parentId: number): Promise<ApiResponse<Module[]>> => {
    const response = await api.get<ApiResponse<Module[]>>(
      `/api/v1/admin/modules/${parentId}/submodules`,
    );
    return response.data;
  },

  createModule: async (data: CreateModuleDTO): Promise<ApiResponse<Module>> => {
    const response = await api.post<ApiResponse<Module>>(
      "/api/v1/admin/modules",
      data,
    );
    return response.data;
  },

  updateModule: async (
    id: number,
    data: UpdateModuleDTO,
  ): Promise<ApiResponse<Module>> => {
    const response = await api.put<ApiResponse<Module>>(
      `/api/v1/admin/modules/${id}`,
      data,
    );
    return response.data;
  },

  deleteModule: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      `/api/v1/admin/modules/${id}`,
    );
    return response.data;
  },

  // ==================== PERMISSION MANAGEMENT ====================
  getPermissionsMatrix: async (): Promise<ApiResponse<PermissionsMatrix>> => {
    const response = await api.get<ApiResponse<PermissionsMatrix>>(
      "/api/v1/admin/permissions/matrix",
    );
    return response.data;
  },

  getRolePermissions: async (
    roleId: number,
  ): Promise<ApiResponse<Permission[]>> => {
    const response = await api.get<ApiResponse<Permission[]>>(
      `/api/v1/admin/permissions/role/${roleId}`,
    );
    return response.data;
  },

  setRolePermission: async (
    data: SetRolePermissionDTO,
  ): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      "/api/v1/admin/permissions/role",
      data,
    );
    return response.data;
  },

  getUserPermissions: async (
    userId: number,
  ): Promise<
    ApiResponse<{
      role: { id: number; name: string } | null;
      permissions: Permission[];
    }>
  > => {
    const response = await api.get<
      ApiResponse<{
        role: { id: number; name: string } | null;
        permissions: Permission[];
      }>
    >(`/api/v1/admin/permissions/user/${userId}`);
    return response.data;
  },

  setUserPermission: async (
    data: SetUserPermissionDTO,
  ): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      "/api/v1/admin/permissions/user",
      data,
    );
    return response.data;
  },

  removeUserPermission: async (
    userId: number,
    moduleId: number,
  ): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      `/api/v1/admin/permissions/user/${userId}/${moduleId}`,
    );
    return response.data;
  },
};

export default adminService;
