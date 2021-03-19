import * as mongoose from 'mongoose';

export const TaxRatesSchema = new mongoose.Schema(
  {
    state: String,
    postalCode: String,
    taxRate: Number,
  },
  {
    timestamps: true,
  },
);
