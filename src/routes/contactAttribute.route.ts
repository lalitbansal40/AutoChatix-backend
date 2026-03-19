import express from "express";
import { getContactAttributes, upsertContactAttributes } from "../controllers/contactAttribute.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/",authMiddleware, upsertContactAttributes);
router.get("/",authMiddleware, getContactAttributes);

export default router;