"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CollegeInvitationSchema = new mongoose.Schema({
    fullname: { type: String, required: true, trim: true },
    emailAddress: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    domainSignup: { type: Boolean, default: false },
    commission: { type: Number, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'partner-groups' },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    date_accepted: { type: Date },
    isSuspended: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.CollegeInvitationSchema.query.byTitle = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
exports.CollegeInvitationSchema.query.byCollege = function (collegeId) {
    return this.where({ collegeId });
};
exports.CollegeInvitationSchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=college-invitation.model.js.map