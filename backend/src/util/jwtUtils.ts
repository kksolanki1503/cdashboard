import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/index.js";

export interface TokenPayload {
  userId: number;
  email: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): DecodedToken {
  return jwt.verify(token, jwtConfig.secret) as DecodedToken;
}
