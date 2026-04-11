import express from "express";
import multer from "multer";
import { uploadMediaController } from "../controllers/template.controller";

const router = express.Router();

// 🔥 multer config (memory)
const upload = multer({
  storage: multer.memoryStorage(),
});

// 🔥 ROUTE
router.post("/upload", upload.single("file"), uploadMediaController);

export default router;