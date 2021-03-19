"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.PayoutSchema = new mongoose.Schema({
    collegeId: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    amount: { type: Number, required: true },
    approvedDate: { type: Date },
    status: { type: String, enum: ['pending', 'approved', 'declined'] },
    collegeUserId: { type: mongoose.Types.ObjectId, ref: 'users' },
    unmudlUserId: { type: mongoose.Types.ObjectId, ref: 'users' },
}, {
    timestamps: true,
});
//# sourceMappingURL=payout.model.js.map