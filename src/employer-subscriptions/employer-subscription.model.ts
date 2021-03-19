import * as mongoose from 'mongoose';

export const EmployerSubscriptionSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Types.ObjectId, ref: 'employer-companies' },
    activePlan: { type: mongoose.Types.ObjectId, ref: 'employer-subscription-plans' },
    activePriceStripeId: { type: String },
    activePriceInterval: { type: String, enum: ['month', 'year', ''] },
    activePlanSubscribedOn: { type: Date },
    activePlanExpiryDate: { type: Date },
    expiredOn: { type: Date },
    stripeSubscriptionId: { type: String },
    status: {
      type: String,
      enum: [
        'pending',
        'active',
        'changed-plan',
        'canceled-by-customer',
        'canceled-by-admin',
        'canceled-by-system',
        'expired-payment-failed',
      ],
      default: 'active',
    },
    prevSubscriptionPlan: { type: mongoose.Types.ObjectId, ref: 'employer-subscription-plans' },
    prevSubscription: { type: mongoose.Types.ObjectId, ref: 'employer-subscriptions' },
    nextSubscriptionPlan: { type: mongoose.Types.ObjectId, ref: 'employer-subscription-plans' },
    nextSubscription: { type: mongoose.Types.ObjectId, ref: 'employer-subscriptions' },
    connectedCollege: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    connectedState: { longName: String, shortName: String },
    lastCollegeUpdated: { type: Date },
    lastStateUpdated: { type: Date },
    firstSubscriptionPayment: { type: Number },
  },
  {
    timestamps: true,
  },
);
