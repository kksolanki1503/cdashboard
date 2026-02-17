// Permission Master interface
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

// Role/User Permission interfaces
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
