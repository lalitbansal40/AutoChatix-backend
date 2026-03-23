import { Request, Response } from "express";
import axios from "axios";
import { Channel } from "../models/channel.model";
import { uploadToS3V2 } from "../services/s3v2.service";

// 🔥 Helper: Get Channel
const getChannel = async (channelId: string) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new Error("Channel not found");
  return channel;
};

// ✅ Create Marketing Template
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    let { name, language, category, components } = req.body;

    // ✅ BASIC VALIDATION
    if (!name || !language || !category || !components) {
      return res.status(400).json({
        success: false,
        message: "name, language, category, components are required",
      });
    }

    if (!Array.isArray(components)) {
      return res.status(400).json({
        success: false,
        message: "components must be an array",
      });
    }

    const channel = await getChannel(channelId);

    // ✅ NAME FORMAT FIX (Meta requirement 🔥)
    name = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    // ✅ SANITIZE + VALIDATE COMPONENTS
    const sanitizedComponents = components.map((comp: any) => {
      // 🔹 HEADER
      if (comp.type === "HEADER") {
        if (comp.format === "TEXT") {
          if (!comp.text) {
            throw new Error("Header text is required");
          }

          return {
            type: "HEADER",
            format: "TEXT",
            text: comp.text,
          };
        }

        // IMAGE / VIDEO / DOCUMENT
        const url = comp?.example?.header_handle?.[0];

        if (!url) {
          throw new Error("Media URL missing in header");
        }

        if (!url.startsWith("http")) {
          throw new Error("Invalid media URL (must be public URL)");
        }

        // 🔥 VERY IMPORTANT FIX (META ISSUE)
        if (!url.includes(".")) {
          throw new Error(
            "Media URL must contain file extension (.jpg/.png/.mp4/.pdf)",
          );
        }

        return {
          type: "HEADER",
          format: comp.format,
          example: {
            header_handle: [url],
          },
        };
      }

      // 🔹 BODY
      if (comp.type === "BODY") {
        if (!comp.text) {
          throw new Error("BODY text is required");
        }

        return {
          type: "BODY",
          text: comp.text,
        };
      }

      // 🔹 BUTTONS
      if (comp.type === "BUTTONS") {
        if (!Array.isArray(comp.buttons)) {
          throw new Error("Buttons must be array");
        }

        const buttons = comp.buttons.map((btn: any) => {
          if (!btn.text) {
            throw new Error("Button text required");
          }

          if (btn.type === "PHONE_NUMBER") {
            return {
              type: "PHONE_NUMBER",
              text: btn.text,
              phone_number: btn.phone_number,
            };
          }

          if (btn.type === "URL") {
            return {
              type: "URL",
              text: btn.text,
              url: btn.url,
            };
          }

          return {
            type: "QUICK_REPLY",
            text: btn.text,
          };
        });

        return {
          type: "BUTTONS",
          buttons,
        };
      }

      return comp;
    });

    // ✅ FINAL PAYLOAD
    const payload = {
      name,
      language,
      category,
      components: sanitizedComponents,
    };

    console.log("META PAYLOAD:", JSON.stringify(payload, null, 2));

    // ✅ META API CALL
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${channel.waba_id}/message_templates`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${channel.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error(
      "CREATE TEMPLATE ERROR:",
      error?.response?.data || error.message,
    );

    return res.status(500).json({
      success: false,
      message: error?.response?.data || error.message,
    });
  }
};

// ✅ Get All Templates
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    const channel = await getChannel(channelId);

    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${channel.waba_id}/message_templates`,
      {
        headers: {
          Authorization: `Bearer ${channel.access_token}`,
        },
      },
    );

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.response?.data || error.message,
    });
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { channelId, templateId } = req.params;

    const channel = await getChannel(channelId);

    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${templateId}`,
      {
        headers: {
          Authorization: `Bearer ${channel.access_token}`,
        },
      },
    );

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.response?.data || error.message,
    });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { channelId, templateId } = req.params;
    const { name, language, category, components } = req.body;

    const channel = await getChannel(channelId);

    // 🔥 new unique name (required by Meta)
    const newName = `${name}_v${Date.now()}`;

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${channel.waba_id}/message_templates`,
      {
        name: newName,
        language,
        category,
        components,
      },
      {
        headers: {
          Authorization: `Bearer ${channel.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.json({
      success: true,
      message: "Template updated (recreated)",
      data: response.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.response?.data || error.message,
    });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { channelId, templateId } = req.params;

    const channel = await getChannel(channelId);

    await axios.delete(`https://graph.facebook.com/v19.0/${templateId}`, {
      headers: {
        Authorization: `Bearer ${channel.access_token}`,
      },
    });

    return res.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.response?.data || error.message,
    });
  }
};

export const uploadMediaController = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File required" });
    }

    const url = await uploadToS3V2(file.buffer, file.mimetype);

    return res.json({
      success: true,
      url,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
