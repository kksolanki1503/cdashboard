import { z } from "zod";

export const signUpSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  }),
});

export const signInSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Refresh token is sent via HTTP-only cookie, no body validation needed
export const refreshTokenSchema = z.object({});

// Logout uses HTTP-only cookie for refresh token, no body validation needed
export const logoutSchema = z.object({});

export type SignUpInput = z.infer<typeof signUpSchema>["body"];
export type SignInInput = z.infer<typeof signInSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type LogoutInput = z.infer<typeof logoutSchema>["body"];
