import * as mongoose from 'mongoose';

export const EmployerSubscriptionPromoSchema = new mongoose.Schema(
  {
    title: { type: String },
    stripeTitle: { type: String },
    percentage: { type: Number },
    maxUses: { type: Number },
    used: { type: Number, default: 0 },
    date: { start: { type: Date }, end: { type: Date } },
    duration: { type: String, enum: ['forever', 'once'] },
    applyToPlans: { type: String, enum: ['all', 'selected'] },
    plans: [{ type: mongoose.Types.ObjectId, ref: 'employer-subscription-plans' }],
    status: { type: String, enum: ['active', 'suspended'] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  },
  { timestamps: true },
);
