import { Router } from "express";
import v1Routes from "./v1/index.js";

const router = Router();

router.use("/api/v1", v1Routes);

// Health check endpoint
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
