export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  revoked: boolean;
}

export interface CreateRefreshTokenDTO {
  user_id: number;
  token: string;
  expires_at: Date;
}
