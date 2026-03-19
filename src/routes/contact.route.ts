import express from "express";
import {
  createContact,
  getContactById,
  getContactsByChannel,
  updateContact,
} from "../controllers/contact.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/:channelId", authMiddleware, getContactsByChannel);
router.post("/:channelId", authMiddleware, createContact);
router.patch("/:contactId", authMiddleware, updateContact);
router.get("/details/:contactId", authMiddleware, getContactById);

export default router;
