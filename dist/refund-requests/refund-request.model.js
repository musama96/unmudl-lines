"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var RefundRequestReason;
(function (RefundRequestReason) {
    RefundRequestReason["DUPLICATE"] = "duplicate";
    RefundRequestReason["UNINTENTIONAL"] = "unintentional";
    RefundRequestReason["WRONG_AMOUNT"] = "wrong-amount";
    RefundRequestReason["NEEDS_NOT_MET"] = "needs-not-met";
    RefundRequestReason["NOT_AS_ADVERTISED"] = "not-as-advertised";
    RefundRequestReason["CHANGED_MIND"] = "changed-mind";
})(RefundRequestReason = exports.RefundRequestReason || (exports.RefundRequestReason = {}));
exports.RefundRequestSchema = new mongoose.Schema({
    requestedBy: { type: mongoose.Types.ObjectId, ref: 'learners' },
    courseId: { type: mongoose.Types.ObjectId, ref: 'courses' },
    enrollmentId: { type: mongoose.Types.ObjectId, ref: 'enrollments' },
    status: { type: String, enum: ['pending', 'refunded', 'rejected'] },
    dateResolved: { type: Date },
    reason: [{ type: String }],
    otherInfo: { type: String },
    transactionId: { type: String },
    transferId: { type: String },
    refundAmount: { type: Number },
    refundId: { type: String },
}, {
    timestamps: true,
});
//# sourceMappingURL=refund-request.model.js.map