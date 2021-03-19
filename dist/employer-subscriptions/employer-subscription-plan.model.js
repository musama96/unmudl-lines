"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerSubscriptionPlanSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});
//# sourceMappingURL=employer-subscription-plan.model.js.map