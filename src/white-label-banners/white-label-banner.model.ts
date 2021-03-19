import * as mongoose from 'mongoose';

export const WhiteLabelBannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    identifier: { type: String },
    description: { type: String },
    live: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
