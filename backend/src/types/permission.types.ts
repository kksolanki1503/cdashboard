// Role Module access (simplified permissions - just tracks which modules a role can access)
export interface RoleModule {
  id: number;
  role_id: number;
  module_id: number;
  created_at: Date;
}

export interface CreateRoleModuleDTO {
  role_id: number;
  module_id: number;
}

// User Module access (extra modules a user can access beyond their role)
export interface UserModule {
  id: number;
  user_id: number;
  module_id: number;
  created_at: Date;
}

export interface CreateUserModuleDTO {
  user_id: number;
  module_id: number;
}

// Permission Response DTO - simplified to just show module access
export interface ModuleAccessDTO {
  module_id: number;
  module_name: string;
  parent_id: number | null;
  has_access: boolean;
  source: "role" | "user" | "combined";
}

export interface UserModulesResponseDTO {
  role: {
    id: number;
    name: string;
  } | null;
  modules: ModuleAccessDTO[];
}

// Legacy types - kept for backwards compatibility but not used
// These are no longer needed with the simplified system

export interface PermissionMaster {
  id: number;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePermissionMasterDTO {
  name: string;
  code: string;
  description?: string;
  active?: boolean;
}

export interface PermissionMasterResponseDTO {
  id: number;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
}

export interface Permission {
  id: number;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_update: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RolePermission extends Permission {
  role_id: number;
  module_id: number;
}

export interface UserPermission extends Permission {
  user_id: number;
  module_id: number;
}

export interface CreateRolePermissionDTO {
  role_id: number;
  module_id: number;
  can_read?: boolean;
  can_write?: boolean;
  can_delete?: boolean;
  can_update?: boolean;
  active?: boolean;
}

export interface CreateUserPermissionDTO {
  user_id: number;
  module_id: number;
  can_read?: boolean;
  can_write?: boolean;
  can_delete?: boolean;
  can_update?: boolean;
  active?: boolean;
}

export interface UpdateRolePermissionDTO {
  can_read?: boolean;
  can_write?: boolean;
  can_delete?: boolean;
  can_update?: boolean;
  active?: boolean;
}

export interface UpdateUserPermissionDTO {
  can_read?: boolean;
  can_write?: boolean;
  can_delete?: boolean;
  can_update?: boolean;
  active?: boolean;
}

export interface PermissionResponseDTO {
  module_id: number;
  module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_update: boolean;
  active: boolean;
  source: "role" | "user" | "combined";
}

export interface UserPermissionsResponseDTO {
  role: {
    id: number;
    name: string;
  } | null;
  permissions: PermissionResponseDTO[];
}
