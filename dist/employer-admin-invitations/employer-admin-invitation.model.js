"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerAdminInvitationSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    emailAddress: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ['recruiter', 'admin', 'superadmin'], required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-companies' },
    employerAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
}, {
    timestamps: true,
});
//# sourceMappingURL=employer-admin-invitation.model.js.map