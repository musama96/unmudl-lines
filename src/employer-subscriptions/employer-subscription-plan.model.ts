import * as mongoose from 'mongoose';

export const EmployerSubscriptionPlanSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    accountLimit: { type: Number },
    monthlyPrice: { type: Number },
    yearlyPrice: { type: Number },
    features: [{ type: String }],
    stripeProductId: { type: String },
    level: { type: Number },
    prices: {
      monthly: {
        stripeId: String,
        price: Number,
      },
      yearly: {
        stripeId: String,
        price: Number,
      },
    },
  },
  {
    timestamps: true,
  },
);
