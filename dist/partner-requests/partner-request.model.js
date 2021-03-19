"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.PartnerRequestSchema = new mongoose.Schema({
    contactPerson: { type: String, required: true, trim: true },
    collegeName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    timezone: { type: String, trim: true },
    dayOfWeek: { type: String, trim: true },
    totalEnrollments: { type: Number },
    nonCreditCourses: { type: Boolean, default: false },
    contactTime: { type: String, default: 'afternoon' },
    additionalInformation: { type: String, required: false },
    status: { type: String, enum: ['pending', 'rejected', 'approved'] },
}, {
    timestamps: true,
});
exports.PartnerRequestSchema.query.byKeyword = function (keyword) {
    return this.where({ collegeName: { $regex: keyword, $options: 'i' } });
};
exports.PartnerRequestSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=partner-request.model.js.map