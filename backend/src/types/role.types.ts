export interface Role {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface RoleResponseDTO {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}
