import { Request, Response } from "express";
import { authService } from "../service/index.js";
import { asyncHandler, AuthRequest } from "../middleware/index.js";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const result = await authService.signUp(name, email, password);

  res.status(201).json({
    success: true,
    data: result,
    message: "User registered successfully",
    statusCode: 201,
    timestamp: new Date().toISOString(),
  });
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.signIn(email, password);

  res.status(200).json({
    success: true,
    data: result,
    message: "Sign in successful",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
      message: "Token refreshed successfully",
      statusCode: 200,
      timestamp: new Date().toISOString(),
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await authService.logout(refreshToken);

  res.status(200).json({
    success: true,
    data: result,
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
