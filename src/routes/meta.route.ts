// routes/meta.route.ts
import express from "express";
import { metaCallback } from "../controllers/meta.controller";

const router = express.Router();

router.get("/callback", metaCallback);

export default router;