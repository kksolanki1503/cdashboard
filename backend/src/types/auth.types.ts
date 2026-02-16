export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    approved: boolean;
    active: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}
