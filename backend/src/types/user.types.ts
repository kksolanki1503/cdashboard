export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  approved: boolean;
  active: boolean;
  role_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role_id?: number;
}

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  approved: boolean;
  active: boolean;
  role_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export function toUserResponseDTO(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    approved: user.approved,
    active: user.active,
    role_id: user.role_id,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
