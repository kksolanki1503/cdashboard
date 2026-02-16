import { userRepository, refreshTokenRepository } from "../repository/index.js";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../util/index.js";
import {
  type AuthResponse,
  type RefreshTokenResponse,
  type LogoutResponse,
  type CreateUserDTO,
  toUserResponseDTO,
} from "../types/index.js";
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from "../error/index.js";

export class AuthService {
  async signUp(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData: CreateUserDTO = {
      name,
      email,
      password: hashedPassword,
    };

    const user = await userRepository.create(userData);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await refreshTokenRepository.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        approved: user.approved,
        active: user.active,
      },
      accessToken,
      refreshToken,
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if user is active
    if (!user.active) {
      throw new ForbiddenError("Account has been deactivated");
    }

    // Check if user is approved
    if (!user.approved) {
      throw new ForbiddenError("Account is pending approval");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await refreshTokenRepository.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        approved: user.approved,
        active: user.active,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Check if refresh token exists in database and is not revoked
    const storedToken = await refreshTokenRepository.findByToken(token);
    if (!storedToken || storedToken.revoked) {
      throw new UnauthorizedError("Invalid or revoked refresh token");
    }

    // Check if refresh token is expired
    if (new Date() > storedToken.expires_at) {
      throw new UnauthorizedError("Refresh token has expired");
    }

    // Get user
    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.active || !user.approved) {
      throw new UnauthorizedError("User not found or inactive");
    }

    // Revoke old refresh token
    await refreshTokenRepository.revoke(token);

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.create({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(token: string): Promise<LogoutResponse> {
    // Revoke the refresh token
    await refreshTokenRepository.revoke(token);

    return {
      message: "Logged out successfully",
    };
  }

  async getCurrentUser(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    return toUserResponseDTO(user);
  }
}

export default new AuthService();
