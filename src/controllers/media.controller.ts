import { Request, Response } from "express";
import { uploadToS3V2 } from "../services/s3v2.service";


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