"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const id_counter_model_1 = require("../id-counters/id-counter.model");
var UserRoles;
(function (UserRoles) {
    UserRoles["SUPERADMIN"] = "superadmin";
    UserRoles["ADMIN"] = "admin";
    UserRoles["MODERATOR"] = "moderator";
    UserRoles["MANAGER"] = "manager";
    UserRoles["INSTRUCTOR"] = "instructor";
})(UserRoles = exports.UserRoles || (exports.UserRoles = {}));
exports.UserSchema = new mongoose.Schema({
    fullname: { type: String, required: true, trim: true },
    emailAddress: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false },
    role: { type: String, enum: ['instructor', 'moderator', 'manager', 'admin', 'superadmin', 'api', 'system'], required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    lastLoggedIn: { type: Date },
    designation: { type: String },
    contact: {
        number: { type: String },
        linkedIn: { type: String },
    },
    mailingAddress: { type: String },
    bio: { type: String },
    profilePhoto: { type: String },
    profilePhotoThumbnail: { type: String },
    invitation: { type: String, enum: ['pending', 'accepted'], default: 'accepted' },
    isSuspended: { type: Boolean, default: false },
    notifications: {
        email: { type: Boolean, default: true },
        enrollment: { type: Boolean, default: true },
        refund: { type: Boolean, default: true },
        newNotification: { type: Boolean, default: true },
        buyCourse: { type: Boolean, default: true },
    },
    totalRevenue: { type: Number, default: 0, select: false },
    unmudlRevenue: { type: Number, default: 0, select: false },
    collegeRevenue: { type: Number, default: 0, select: false },
    stripeCustomerId: { type: String, required: false },
    numId: { type: Number, unique: true },
    isPromoted: { type: Boolean, default: false },
    archivedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'messages' }],
}, {
    timestamps: true,
});
exports.UserSchema.query.byName = function (keyword) {
    return this.where({ fullname: { $regex: keyword, $options: 'i' } });
};
exports.UserSchema.query.byCollege = function (collegeId) {
    return this.where({ collegeId });
};
exports.UserSchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
const counter = mongoose.model('id-counters', id_counter_model_1.CounterSchema);
exports.TrashedUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false },
    fullname: { type: String, required: true },
    emailAddress: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: false, select: false },
    role: { type: String, enum: ['instructor', 'moderator', 'manager', 'admin', 'superadmin'], required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    lastLoggedIn: { type: Date },
    designation: { type: String },
    bio: { type: String },
    contact: {
        number: { type: String },
        linkedIn: { type: String },
    },
    mailingAddress: {
        street: { type: String },
        city: { type: String },
    },
    profilePhoto: { type: String },
    profilePhotoThumbnail: { type: String },
    invitation: { type: String, enum: ['pending', 'accepted'], default: 'accepted' },
    isSuspended: { type: Boolean, default: false },
    notifications: {
        email: { type: Boolean, default: true },
        enrollment: { type: Boolean, default: true },
        refund: { type: Boolean, default: true },
        newNotification: { type: Boolean, default: true },
        buyCourse: { type: Boolean, default: true },
    },
    stripeCustomerId: { type: String, required: false },
    archivedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'messages' }],
}, {
    timestamps: true,
});
//# sourceMappingURL=user.model.js.map