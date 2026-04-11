import { Router } from "express";
import {
  createTemplate,
  deleteTemplate,
  getTemplateById,
  getTemplates,
  sendBulkTemplate,
  sendTemplate,
  updateTemplate,
  uploadMediaController,
  syncTemplates,
  getAllWhatsappFlows, // 🔥 ADD THIS
} from "../controllers/template.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { subscriptionGuard } from "../middlewares/subcription.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

/**
 * 🔐 Apply middlewares globally (BEST PRACTICE)
 */
router.use(authMiddleware, subscriptionGuard);

/**
 * 🔥 SYNC TEMPLATES (IMPORTANT - keep above dynamic routes)
 */
router.post("/sync/:channelId", syncTemplates);

/**
 * 📁 MEDIA UPLOAD
 */
router.post(
  "/upload-media/:channelId",
  upload.single("file"),
  uploadMediaController,
);

/**
 * 📄 TEMPLATE CRUD
 */

// ✅ Get all templates
router.get("/whatsapp-flow", authMiddleware, getAllWhatsappFlows);
router.get("/:channelId", authMiddleware, getTemplates);

// ✅ Get single template
router.get("/:channelId/:templateId", authMiddleware, getTemplateById);

// ✅ Create template
router.post("/:channelId", authMiddleware, createTemplate);

// ✅ Send template
router.post("/send-template/:channelId", authMiddleware, sendTemplate);

// ✅ Bulk send template
router.post(
  "/send-bulk/:channelId",
  upload.single("file"),
  authMiddleware,
  sendBulkTemplate,
);

// ✅ Update template (recreate)
router.put("/:channelId/:templateId", authMiddleware, updateTemplate);

// ✅ Delete template
router.delete("/:channelId/:templateId", authMiddleware, deleteTemplate);

export default router;
