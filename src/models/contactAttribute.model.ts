import mongoose, { Schema, Document } from "mongoose";

export interface ContactAttributeDefinition extends Document {
  account_id: mongoose.Types.ObjectId;

  attributes: {
    id: string;        // unique key
    name: string;      // display name
    type: "string" | "number" | "boolean" | "object";
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const ContactAttributeSchema = new Schema<ContactAttributeDefinition>(
  {
    account_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      unique: true // 🔥 one schema per account
    },

    attributes: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ["string", "number", "boolean", "object"],
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

const ContactAttribute =
  mongoose.models.ContactAttribute ||
  mongoose.model<ContactAttributeDefinition>(
    "ContactAttribute",
    ContactAttributeSchema
  );

export default ContactAttribute;