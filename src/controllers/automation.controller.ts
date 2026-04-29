import { Request, Response } from "express";
import Automation from "../models/automation.model";
import { AuthRequest } from "../types/auth.types";

/* =========================================
   1️⃣ GET ALL AUTOMATIONS (WITH FILTER)
========================================= */
export const getAutomations = async (req: AuthRequest, res: Response) => {
  try {
    const { channel_id } = req.query;
    const account_id = req.user?.account_id;

    const filter: any = {
      account_id,
      is_fallback_automation: false,
    };

    // 🔥 optional filter
    if (channel_id) {
      filter.channel_id = channel_id;
    }

    const automations = await Automation.find(filter)
      .select("_id name status channel_id channel_name createdAt updatedAt")
      .populate("channel_id", "name phone_number")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: automations,
    });
  } catch (error) {
    console.error("❌ getAutomations error:", error);
    return res.status(500).json({ success: false });
  }
};

/* =========================================
   2️⃣ PLAY / PAUSE AUTOMATION
========================================= */
export const toggleAutomationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log("👉 TOGGLE ID:", id);

    const automation = await Automation.findById(id);

    // ✅ MOST IMPORTANT FIX
    if (!automation) {
      return res.status(404).json({
        success: false,
        message: "Automation not found",
      });
    }

    automation.status =
      automation.status === "active" ? "paused" : "active";

    await automation.save();

    return res.json({
      success: true,
      data: automation,
    });

  } catch (error) {
    console.error("❌ TOGGLE ERROR:", error);

    // ✅ ALWAYS RETURN RESPONSE
    return res.status(500).json({
      success: false,
      message: "Internal error",
    });
  }
};

/* =========================================
   3️⃣ DELETE AUTOMATION
========================================= */
export const deleteAutomation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const automation = await Automation.findByIdAndDelete(id);

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: "Automation not found",
      });
    }

    return res.json({
      success: true,
      message: "Automation deleted successfully",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("❌ deleteAutomation error:", error);
    return res.status(500).json({ success: false });
  }
};

export const getAutomationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const account_id = req.user?.account_id;

    const automation = await Automation.findOne({
      _id: id,
      account_id, // 🔥 security (important)
    })
      .populate("channel_id", "name phone_number")
      .lean();

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: "Automation not found",
      });
    }

    const triggerNode = automation.nodes?.find(
      (n: any) => n.type === "trigger"
    );

    if (triggerNode) {
      // 🔥 INJECT BACK INTO NODE
      triggerNode.triggerType =
        automation.keywords && automation.keywords.length > 0
          ? "keyword"
          : "all";

      triggerNode.keywords = automation.keywords || [];
    }

    return res.json({
      success: true,
      data: automation, // 🔥 full JSON (nodes + edges)
    });
  } catch (error) {
    console.error("❌ getAutomationById error:", error);
    return res.status(500).json({ success: false });
  }
};

export const createAutomation = async (req: AuthRequest, res: Response) => {
  try {
    const account_id = req.user?.account_id;

    const {
      name,
      channel_id,
      channel_name,
      nodes,
      edges,
      keywords = [],
    } = req.body;

    // 🔥 BASIC VALIDATION
    if (!name || !channel_id || !nodes || !edges) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 🔥 CHECK START NODE
    const hasTrigger = nodes.find((n: any) => n.type === "trigger");
    if (!hasTrigger) {
      return res.status(400).json({
        success: false,
        message: "Trigger node is required",
      });
    }

    // 🔥 SANITIZE NODES (important)
    const sanitizedNodes = nodes.map((node: any) => ({
      ...node,
      id: node.id,
      type: node.type,
    }));

    // 🔥 SANITIZE EDGES
    const sanitizedEdges = edges.map((edge: any) => ({
      from: edge.from,
      to: edge.to,
      condition: edge.condition || "",
    }));

    const automation = await Automation.create({
      name,
      channel_id,
      channel_name,
      account_id,
      nodes: sanitizedNodes,
      edges: sanitizedEdges,
      keywords,
      trigger: "new_message_received",
      automation_type: "builder",
    });

    return res.json({
      success: true,
      message: "Automation created successfully",
      data: automation,
    });
  } catch (error) {
    console.error("❌ createAutomation error:", error);
    return res.status(500).json({ success: false });
  }
};

export const updateAutomation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const account_id = req.user?.account_id;

    const { name, nodes, edges, status } = req.body;

    const automation = await Automation.findOne({
      _id: id,
      account_id,
    });

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: "Automation not found",
      });
    }

    /* =========================
       VALIDATION
    ========================= */

    if (nodes) {
      const triggerNode = nodes.find((n: any) => n.type === "trigger");

      if (!triggerNode) {
        return res.status(400).json({
          success: false,
          message: "Trigger node is required",
        });
      }

      // ✅ SAVE KEYWORDS (MAIN FIX)
      automation.keywords =
        triggerNode.triggerType === "keyword"
          ? triggerNode.keywords || []
          : [];

      automation.nodes = nodes.map((n: any) => ({
        ...n,
        id: n.id,
        type: n.type,
      }));
    }

    /* =========================
       UPDATE BASIC FIELDS
    ========================= */

    if (name !== undefined) automation.name = name;
    if (status !== undefined) automation.status = status;

    /* =========================
       SAVE NODES
    ========================= */

    if (nodes) {
      automation.nodes = nodes.map((n: any) => ({
        ...n,
        id: n.id,
        type: n.type,
      }));
    }

    /* =========================
       SAVE EDGES
    ========================= */

    if (edges) {
      automation.edges = edges.map((e: any) => ({
        from: e.from,
        to: e.to,
        condition: e.condition || "",
      }));
    }

    await automation.save();

    return res.json({
      success: true,
      message: "Automation updated successfully",
      data: automation,
    });

  } catch (error) {
    console.error("❌ updateAutomation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};