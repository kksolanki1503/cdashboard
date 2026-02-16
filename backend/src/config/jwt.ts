export const jwtConfig = {
  secret: process.env.JWT_SECRET ?? "your_super_secret_key_here",
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
};
