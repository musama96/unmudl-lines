import * as mongoose from 'mongoose';

export const EmployerIndustrySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    NAICS_codes: {type: String},
  },
  {
    timestamps: true,
  },
);
