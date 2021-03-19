"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.GiftCourseSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Types.ObjectId, ref: 'learners' },
    recipientName: { type: String },
    recipientEmail: { type: String },
    senderId: { type: mongoose.Types.ObjectId, ref: 'learners' },
    senderName: { type: String },
    senderEmail: { type: String },
    message: { type: String },
    giftCode: { type: String },
    courseId: { type: mongoose.Types.ObjectId, ref: 'courses' },
    promoId: { type: mongoose.Schema.Types.ObjectId, ref: 'promos', default: null },
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'enrollments', default: null },
    discountPercentage: { type: Number, default: 0 },
    discountType: { type: String, enum: ['unmudl', 'both'] },
    discountTotal: { type: Number, default: 0 },
    transactionId: { type: String },
    transferId: { type: String },
    destPaymentId: { type: String },
    salesTax: { type: Number, required: true },
    taxPercentage: { type: Number, required: true },
    totalPaid: { type: Number, required: true },
    totalRevenue: { type: Number, default: 0, required: true },
    unmudlShare: { type: Number, required: true },
    unmudlSharePercentage: { type: Number, required: true },
    collegeShare: { type: Number, required: true },
    sentToCollege: { type: Number, required: false, default: 0 },
    keptByUnmudl: { type: Number, required: false, default: 0 },
    stripeFee: { type: Number, required: true },
    courseFee: { type: Number, required: true },
    chargeAttempts: { type: Number, default: 0 },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'processed', 'transferred', 'declined', 'canceled', 'refunded'],
    },
}, {
    timestamps: true,
});
//# sourceMappingURL=gift-a-course.model.js.map