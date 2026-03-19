import { Request, Response } from "express";
import mongoose from "mongoose";
import ContactAttribute from "../models/contactAttribute.model";

export const upsertContactAttributes = async (req: Request, res: Response) => {
  try {
    const accountId = (req.user as any)?.user_id;
    const { attributes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accountId",
      });
    }

    if (!Array.isArray(attributes)) {
      return res.status(400).json({
        success: false,
        message: "Attributes must be an array",
      });
    }

    const updated = await ContactAttribute.findOneAndUpdate(
      { account_id: accountId },
      { attributes },
      { new: true, upsert: true },
    );

    return res.status(200).json({
      success: true,
      message: "Attributes saved successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getContactAttributes = async (req: Request, res: Response) => {
  try {
    const accountId = (req.user as any)?.user_id;

    const data = await ContactAttribute.findOne({
      account_id: accountId,
    });

    return res.status(200).json({
      success: true,
      data: data?.attributes || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
