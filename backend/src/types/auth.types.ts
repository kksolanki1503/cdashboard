export interface ModulePermissionDTO {
  module_id: number;
  module_name: string;
  parent_id: number | null;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    approved: boolean;
    active: boolean;
  };
  modules: ModulePermissionDTO[];
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  user: {
    id: number;
    name: string;
    email: string;
    approved: boolean;
    active: boolean;
  };
  modules: ModulePermissionDTO[];
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}
