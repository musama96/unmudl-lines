"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerEnquiryMessageSchema = new mongoose.Schema({
    enquiry: { type: mongoose.Types.ObjectId, ref: 'enquiries' },
    message: { type: String, required: true, trim: true },
    employerAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    readByEmployerAdmin: { type: Boolean, default: true },
    readByUsers: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
}, {
    timestamps: true,
});
//# sourceMappingURL=employer-enquiry-message.model.js.map