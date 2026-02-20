import {
  userRepository,
  roleRepository,
  permissionRepository,
} from "../repository/index.js";
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
  type ModuleAccessDTO,
  toUserResponseDTO,
} from "../types/index.js";
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from "../error/index.js";

export class AuthService {
  // Helper method to get user's accessible modules (simplified)
  private async getUserModules(
    userId: number,
    roleId: number | null,
  ): Promise<
    { module_id: number; module_name: string; parent_id: number | null }[]
  > {
    // Use the simplified permission system
    const modules = await permissionRepository.getUserModulesWithModuleNames(
      userId,
      roleId,
    );

    // Filter to only return modules where user has access
    // and remove has_access and source fields
    return modules
      .filter((m) => m.has_access)
      .map((m) => ({
        module_id: m.module_id,
        module_name: m.module_name,
        parent_id: m.parent_id,
      }));
  }

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

    // Get default "user" role
    const defaultRole = await roleRepository.findByName("user");

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default role
    const userData: CreateUserDTO = {
      name,
      email,
      password: hashedPassword,
      ...(defaultRole?.id !== undefined && { role_id: defaultRole.id }),
    };

    const user = await userRepository.create(userData);

    // Generate tokens (stateless - no database storage)
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Get user's accessible modules
    const modules = await this.getUserModules(user.id, user.role_id ?? null);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        approved: user.approved,
        active: user.active,
      },
      modules,
      accessToken,
      refreshToken,
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      ("");
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

    // Generate tokens (stateless - no database storage)
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Get user's accessible modules
    const modules = await this.getUserModules(user.id, user.role_id ?? null);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        approved: user.approved,
        active: user.active,
      },
      modules,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    // Verify the refresh token (stateless JWT verification)
    // This checks both signature and expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Get user from decoded token
    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.active || !user.approved) {
      throw new UnauthorizedError("User not found or inactive");
    }

    // Generate new tokens (stateless - no database storage)
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Get user's accessible modules
    const modules = await this.getUserModules(user.id, user.role_id ?? null);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        approved: user.approved,
        active: user.active,
      },
      modules,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(_token: string): Promise<LogoutResponse> {
    // Stateless logout - just return success
    // The cookie will be cleared by the controller
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
