"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.InvitationSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    emailAddress: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ['instructor', 'moderator', 'manager', 'admin', 'superadmin'], required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    isPromoted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.InvitationSchema.query.byName = function (keyword) {
    return this.where({ fullname: { $regex: keyword, $options: 'i' } });
};
exports.InvitationSchema.query.byCollege = function (collegeId) {
    return this.where({ collegeId });
};
exports.InvitationSchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=invitation.model.js.map