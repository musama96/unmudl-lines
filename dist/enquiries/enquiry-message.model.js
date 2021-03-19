"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EnquiryMessageSchema = new mongoose.Schema({
    enquiry: { type: mongoose.Types.ObjectId, ref: 'enquiries' },
    message: { type: String, required: true, trim: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    readByLearner: { type: Boolean, default: true },
    readByUsers: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
}, {
    timestamps: true,
});
//# sourceMappingURL=enquiry-message.model.js.map