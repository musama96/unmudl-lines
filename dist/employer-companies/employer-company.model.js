"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerCompanySchema = new mongoose.Schema({
    employerLogo: { type: String, required: false },
    employerBanner: { type: String, required: false },
    employerLogoThumbnail: { type: String, required: false },
    title: { type: String, required: true },
    url: { website: { type: String } },
    description: { type: String, required: false },
    size: { type: Number, required: false },
    industries: [{ type: mongoose.Types.ObjectId, ref: 'employer-industries', required: false }],
    address: { type: String },
    city: { type: String },
    state: {
        longName: { type: String },
        shortName: { type: String },
    },
    zip: { type: String },
    country: String,
    coordinates: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    employerGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-groups' },
    isDomainSignup: { type: Boolean, default: false },
    timezone: { type: String, required: false },
    numId: { type: Number, unique: true },
    invitation: { type: String, default: 'pending' },
    stripeCustomerId: { type: String },
    isSuspended: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.EmployerCompanySchema.query.byKeyword = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
exports.EmployerCompanySchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=employer-company.model.js.map