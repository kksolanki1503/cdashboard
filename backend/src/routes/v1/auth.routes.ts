import { Router } from "express";
import {
  signUp,
  signIn,
  refreshToken,
  logout,
  getCurrentUser,
} from "../../controller/index.js";
import { validateRequest, authMiddleware } from "../../middleware/index.js";
import {
  signUpSchema,
  signInSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../../util/zodValidator/index.js";

const router = Router();

// Public routes
router.post("/signup", validateRequest(signUpSchema), signUp);
router.post("/signin", validateRequest(signInSchema), signIn);
router.post("/refresh", validateRequest(refreshTokenSchema), refreshToken);
router.post("/logout", validateRequest(logoutSchema), logout);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

export default router;
