import axios from "axios";
import { Response } from "express";
import { Channel } from "../models/channel.model";
import { AuthRequest } from "../types/auth.types";

const GRAPH = "https://graph.facebook.com/v20.0";

/* ─── helpers ──────────────────────────────────────── */

const getChannel = async (channelId: string, accountId: string) => {
  return Channel.findOne({ _id: channelId, account_id: accountId, is_active: true });
};

/* =====================================================
   GET /api/catalog/:channel_id
   — list product catalogs linked to this WABA
===================================================== */
export const getCatalogs = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.account_id;
    if (!accountId) return res.status(401).json({ message: "Unauthorized" });

    const channel = await getChannel(req.params.channel_id, accountId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const response = await axios.get(`${GRAPH}/${channel.waba_id}/product_catalogs`, {
      headers: { Authorization: `Bearer ${channel.access_token}` },
    });

    return res.json({ catalogs: response.data.data });
  } catch (e: any) {
    console.error("getCatalogs error:", e?.response?.data || e.message);
    return res.status(500).json({ message: "Failed to fetch catalogs", error: e?.response?.data });
  }
};

/* =====================================================
   POST /api/catalog/:channel_id/link
   Body: { catalog_id }
   — link an existing Meta catalog to this WABA
===================================================== */
export const linkCatalog = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.account_id;
    if (!accountId) return res.status(401).json({ message: "Unauthorized" });

    const { catalog_id } = req.body;
    if (!catalog_id) return res.status(400).json({ message: "catalog_id required" });

    const channel = await getChannel(req.params.channel_id, accountId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const response = await axios.post(
      `${GRAPH}/${channel.waba_id}/product_catalogs`,
      { catalog_id },
      { headers: { Authorization: `Bearer ${channel.access_token}` } },
    );

    return res.json({ success: true, data: response.data });
  } catch (e: any) {
    console.error("linkCatalog error:", e?.response?.data || e.message);
    return res.status(500).json({ message: "Failed to link catalog", error: e?.response?.data });
  }
};

/* =====================================================
   DELETE /api/catalog/:channel_id/unlink
   Body: { catalog_id }
   — unlink a catalog from this WABA
===================================================== */
export const unlinkCatalog = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.account_id;
    if (!accountId) return res.status(401).json({ message: "Unauthorized" });

    const { catalog_id } = req.body;
    if (!catalog_id) return res.status(400).json({ message: "catalog_id required" });

    const channel = await getChannel(req.params.channel_id, accountId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const response = await axios.delete(`${GRAPH}/${channel.waba_id}/product_catalogs`, {
      data: { catalog_id },
      headers: { Authorization: `Bearer ${channel.access_token}` },
    });

    return res.json({ success: true, data: response.data });
  } catch (e: any) {
    console.error("unlinkCatalog error:", e?.response?.data || e.message);
    return res.status(500).json({ message: "Failed to unlink catalog", error: e?.response?.data });
  }
};

/* =====================================================
   GET /api/catalog/:channel_id/products/:catalog_id
   Query: ?limit=20&after=<cursor>
   — list products inside a catalog
===================================================== */
export const getCatalogProducts = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.account_id;
    if (!accountId) return res.status(401).json({ message: "Unauthorized" });

    const channel = await getChannel(req.params.channel_id, accountId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const { catalog_id } = req.params;
    const { limit = 20, after } = req.query;

    const params: any = {
      fields: "id,name,retailer_id,price,currency,image_url,availability,description",
      limit,
    };
    if (after) params.after = after;

    const response = await axios.get(`${GRAPH}/${catalog_id}/products`, {
      params,
      headers: { Authorization: `Bearer ${channel.access_token}` },
    });

    return res.json({
      products: response.data.data,
      paging: response.data.paging,
    });
  } catch (e: any) {
    console.error("getCatalogProducts error:", e?.response?.data || e.message);
    return res.status(500).json({ message: "Failed to fetch products", error: e?.response?.data });
  }
};
