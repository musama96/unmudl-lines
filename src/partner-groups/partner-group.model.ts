import * as mongoose from 'mongoose';

export const PartnerGroupSchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
    color: {type: String, required: true},
  },
  {
    timestamps: true,
  },
);

export interface PartnerGroupInterface {
  _id?: string;
  title: string;
  color: string;
}
