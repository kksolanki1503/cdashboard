import { Router } from "express";
import authRoutes from "./auth.routes.js";
import rbacRoutes from "./rbac.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/rbac", rbacRoutes);
router.use("/admin", adminRoutes);

export default router;
