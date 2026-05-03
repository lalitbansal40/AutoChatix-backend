import mongoose, { Schema, Document } from "mongoose";

export interface ContactDocument extends Document {
  phone: string;
  name?: string;
  profile_picture?: string;
  channel_id: mongoose.Types.ObjectId;
  last_message_id: mongoose.Types.ObjectId;

  last_message?: string;
  last_message_at?: Date;

  attributes: {
    type: mongoose.Schema.Types.Mixed;
    default: {};
  };

  is_processing: boolean;

  createdAt: Date;
  updatedAt: Date;
  unread_count: number;
}

const ContactSchema = new Schema<ContactDocument>(
  {
    phone: { type: String, required: true },
    name: { type: String },
    profile_picture: { type: String },

    channel_id: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
    last_message_id: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      index: true,
    },

    last_message: { type: String },
    last_message_at: { type: Date },
    unread_count: { type: Number, default: 0 },

    // 🔥 ALL AUTOMATION DATA STORED HERE
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },

    is_processing: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// one contact per channel + phone
ContactSchema.index({ channel_id: 1, phone: 1 }, { unique: true });

const Contact =
  mongoose.models.Contact ||
  mongoose.model<ContactDocument>("Contact", ContactSchema);

export default Contact;
