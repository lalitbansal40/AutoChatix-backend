import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({});

export const uploadToS3V2 = async (
  buffer: Buffer,
  mimeType: string
) => {
  const key = `whatsapp/${Date.now()}-${uuidv4()}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.WHATSAPP_BUCKET!, // ✅ NEW BUCKET
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return `https://${process.env.WHATSAPP_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};