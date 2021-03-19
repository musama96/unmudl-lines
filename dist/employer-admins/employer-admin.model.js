"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerAdminSchema = new mongoose.Schema({
    fullname: { type: String, required: true, trim: true },
    emailAddress: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false },
    role: { type: String, enum: ['recruiter', 'admin', 'superadmin', 'system'], required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-companies' },
    lastLoggedIn: { type: Date },
    designation: { type: String },
    profilePhoto: { type: String },
    profilePhotoThumbnail: { type: String },
    joinDate: { type: Date, default: null },
    invitation: { type: String, enum: ['pending', 'accepted'], default: 'accepted' },
    isSuspended: { type: Boolean, default: false },
    suspendReason: { type: String, enum: ['non-payment', 'other'] },
    notifications: {
        email: { type: Boolean, default: true },
        proposal: { type: Boolean, default: true },
        chat: { type: Boolean, default: true },
        newNotification: { type: Boolean, default: true },
    },
    archivedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'messages' }],
    stripeCustomerId: { type: String, required: false, default: null },
}, {
    timestamps: true,
});
exports.EmployerAdminSchema.query.byName = function (keyword) {
    return this.where({ fullname: { $regex: keyword, $options: 'i' } });
};
exports.EmployerAdminSchema.query.byEmployer = function (employerId) {
    return this.where({ employerId });
};
exports.EmployerAdminSchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
exports.TrashedEmployerAdminSchema = new mongoose.Schema({
    adminId: { type: mongoose.Types.ObjectId, ref: 'employer-admins', required: false },
    fullname: { type: String, required: true, trim: true },
    emailAddress: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false },
    role: { type: String, enum: ['recruiter', 'admin', 'superadmin'], required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    lastLoggedIn: { type: Date },
    designation: { type: String },
    profilePhoto: { type: String },
    profilePhotoThumbnail: { type: String },
    invitation: { type: String, enum: ['pending', 'accepted'], default: 'accepted' },
    isSuspended: { type: Boolean, default: false },
    notifications: {
        email: { type: Boolean, default: true },
        newNotification: { type: Boolean, default: true },
        buyCourse: { type: Boolean, default: true },
    },
    archivedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'messages' }],
}, {
    timestamps: true,
});
//# sourceMappingURL=employer-admin.model.js.map