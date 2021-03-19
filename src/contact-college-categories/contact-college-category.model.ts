import * as mongoose from 'mongoose';

export const ContactCollegeCategorySchema = new mongoose.Schema(
  {
    title: { type: String },
    subcategories: [{ title: String }],
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);
