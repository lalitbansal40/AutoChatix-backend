import { Request, Response } from "express";
import mongoose from "mongoose";
import Contact from "../models/contact.model";

export const getContactsByChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { search, cursor, limit = 20 } = req.query;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId as string)) {
      return res.status(400).json({
        success: false,
        message: "Valid channelId is required",
      });
    }

    const query: any = {
      channel_id: new mongoose.Types.ObjectId(channelId as string),
    };

    // 🔍 Search by name or phone
    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    // ⬇ Cursor based pagination (load older contacts)
    if (cursor) {
      query.last_message_at = {
        $lt: new Date(cursor as string),
      };
    }

    const contacts = await Contact.find(query)
      .sort({ last_message_at: -1 }) // newest chat first
      .limit(Number(limit))
      .populate("last_message_id"); // optional

    return res.status(200).json({
      success: true,
      count: contacts.length,
      nextCursor:
        contacts.length > 0
          ? contacts[contacts.length - 1].last_message_at
          : null,
      data: contacts,
    });
  } catch (error: any) {
    console.error("Get Contacts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const channel_id = req.params.channelId;
    const { phone, name, attributes = {} } = req.body;

    if (!phone || !channel_id) {
      return res.status(400).json({
        success: false,
        message: "phone and channel_id are required",
      });
    }

    const existingContact = await Contact.findOne({
      phone,
      channel_id,
    });

    if (existingContact) {
      return res.status(200).json({
        success: true,
        message: "Contact already exists",
        data: existingContact,
      });
    }

    // 🔥 Clean attributes (remove undefined/null)
    const cleanedAttributes = Object.fromEntries(
      Object.entries(attributes || {}).filter(
        ([_, v]) => v !== undefined && v !== null && v !== "",
      ),
    );

    const contact = await Contact.create({
      phone,
      name,
      channel_id,
      attributes: cleanedAttributes,
    });

    return res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: contact,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Contact already exists for this channel",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;
    const { name, phone, attributes } = req.body;

    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "contactId is required",
      });
    }

    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // ✅ Basic fields
    if (name !== undefined) contact.name = name;
    if (phone !== undefined) contact.phone = phone;

    // 🔥 Deep merge attributes
    if (attributes && typeof attributes === "object") {
      contact.attributes = deepMerge(contact.attributes || {}, attributes);

      // 🔥 THIS IS THE REAL FIX
      contact.markModified("attributes");
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Phone already exists for this channel",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getContactById = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;

    // 🔴 Validate
    if (!contactId || !mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({
        success: false,
        message: "Valid contactId is required",
      });
    }

    const contact =
      await Contact.findById(contactId).populate("last_message_id"); // optional

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error: any) {
    console.error("Get Contact By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deepMerge = (target: any, source: any) => {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};
