"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerRequestSchema = new mongoose.Schema({
    contactPerson: { type: String, required: true, trim: true },
    employerName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    timezone: { type: String, trim: true },
    dayOfWeek: { type: String, trim: true },
    contactTime: { type: String, default: 'afternoon' },
    additionalInformation: { type: String, required: false },
    totalEmployees: { type: Number },
    status: { type: String, enum: ['pending', 'rejected', 'approved'] },
}, {
    timestamps: true,
});
exports.EmployerRequestSchema.query.byKeyword = function (keyword) {
    return this.where({ collegeName: { $regex: keyword, $options: 'i' } });
};
exports.EmployerRequestSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=employer-request.model.js.map