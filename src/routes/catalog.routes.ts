import { Router } from "express";
import {
  getCatalogs,
  linkCatalog,
  unlinkCatalog,
  getCatalogProducts,
} from "../controllers/catalog.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// GET  /api/catalog/:channel_id                          — list linked catalogs
router.get("/:channel_id", authMiddleware, getCatalogs);

// POST /api/catalog/:channel_id/link                     — link catalog { catalog_id }
router.post("/:channel_id/link", authMiddleware, linkCatalog);

// DELETE /api/catalog/:channel_id/unlink                 — unlink catalog { catalog_id }
router.delete("/:channel_id/unlink", authMiddleware, unlinkCatalog);

// GET  /api/catalog/:channel_id/products/:catalog_id     — list products in catalog
router.get("/:channel_id/products/:catalog_id", authMiddleware, getCatalogProducts);

export default router;
