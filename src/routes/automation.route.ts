import express from "express";
import {
  getAutomations,
  toggleAutomationStatus,
  deleteAutomation,
  getAutomationById,
  createAutomation,      // ✅ ADD
  updateAutomation,      // ✅ ADD
} from "../controllers/automation.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { subscriptionGuard } from "../middlewares/subcription.middleware";

const router = express.Router();

// ✅ GET ALL
router.get("/", authMiddleware, subscriptionGuard, getAutomations);

// ✅ GET SINGLE
router.get("/:id", authMiddleware, subscriptionGuard, getAutomationById);

// ✅ CREATE (🔥 NEW)
router.post(
  "/",
  authMiddleware,
  subscriptionGuard,
  createAutomation
);

// ✅ UPDATE (🔥 NEW)
router.put(
  "/:id",
  authMiddleware,
  subscriptionGuard,
  updateAutomation
);

// ▶️ ⏸ TOGGLE
router.put(
  "/:id/toggle",
  authMiddleware,
  subscriptionGuard,
  toggleAutomationStatus
);

// 🗑 DELETE
router.delete(
  "/:id",
  authMiddleware,
  subscriptionGuard,
  deleteAutomation
);

export default router;