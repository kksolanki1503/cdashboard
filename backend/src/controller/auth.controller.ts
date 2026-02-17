import { Request, Response } from "express";
import { authService } from "../service/index.js";
import { asyncHandler, AuthRequest } from "../middleware/index.js";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const result = await authService.signUp(name, email, password);

  // Set refresh token as HTTP-only cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Don't include refresh token in response body
  const { refreshToken, ...data } = result;

  res.status(201).json({
    success: true,
    data,
    message: "User registered successfully",
    statusCode: 201,
    timestamp: new Date().toISOString(),
  });
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.signIn(email, password);

  // Set refresh token as HTTP-only cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Don't include refresh token in response body
  const { refreshToken, ...data } = result;

  res.status(200).json({
    success: true,
    data,
    message: "Sign in successful",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    // Read refresh token from cookie

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Refresh token not found",
        },
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await authService.refreshToken(refreshToken);

    // Set new refresh token as HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't include refresh token in response body
    const { refreshToken: newRefreshToken, ...data } = result;

    res.status(200).json({
      success: true,
      data,
      message: "Token refreshed successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Read refresh token from cookie
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    data: { message: "Logged out successfully" },
    message: "Logged out successfully",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user,
      message: "User fetched successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);
