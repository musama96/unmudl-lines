"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerEnquirySchema = new mongoose.Schema({
    employerAdmin: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    users: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    college: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    type: { type: String, enum: ['college', 'unmudl'] },
}, {
    timestamps: true,
});
//# sourceMappingURL=employer-enquiry.model.js.map