"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CollegeSchema = new mongoose.Schema({
    orgId: { type: String, default: null },
    profilePhoto: { type: String, required: false },
    collegeLogo: { type: String, required: false },
    collegeBanner: { type: String, required: false },
    collegeLogoThumbnail: { type: String, required: false },
    title: { type: String, required: true },
    url: {
        website: { type: String },
        facebook: { type: String },
        twitter: { type: String },
        linkedIn: { type: String },
    },
    description: { type: String, required: false },
    contact: {
        email: { type: String },
        number: { type: String },
        phoneExtension: { type: String },
        name: { type: String },
    },
    communityCollegeId: { type: String, required: false },
    domain: { type: String, required: false },
    address: { type: String },
    streetAddress: { type: String, default: null },
    city: { type: String },
    state: {
        longName: { type: String },
        shortName: { type: String },
    },
    zip: { type: String },
    country: String,
    unmudlShare: { type: Number, default: 15 },
    salesTax: { type: Number, default: 8.25 },
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
    totalRevenue: { type: Number, default: 0, select: false },
    unmudlRevenue: { type: Number, default: 0, select: false },
    collegeRevenue: { type: Number, default: 0, select: false },
    timeZone: {
        offset: { type: Number, default: 6 },
        label: { type: String, default: 'Central' },
        shortForm: { type: String, default: 'CST' },
        value: { type: String, default: 'America/Chicago' },
    },
    stripeId: { type: String, required: false },
    numId: { type: Number, unique: true },
    invitation: { type: String, default: 'pending' },
    partnerGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'partner-groups' },
    isDomainSignup: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    payableToUnmudl: { type: Number, required: false, default: 0 },
}, {
    timestamps: true,
});
exports.CollegeSchema.query.byKeyword = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
exports.CollegeSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
exports.defaultCollegeTimeZones = [
    { label: 'Hawaii', shortForm: 'HST', offset: 10, value: 'America/Adak' },
    { label: 'Alaska', shortForm: 'AST', offset: 9, value: 'America/Anchorage' },
    { label: 'Pacific', shortForm: 'PST', offset: 8, value: 'America/Los_Angeles' },
    { label: 'Mountain', shortForm: 'MST', offset: 7, value: 'America/Boise' },
    { label: 'Central', shortForm: 'CST', offset: 6, value: 'America/Chicago' },
    { label: 'Eastern', shortForm: 'EST', offset: 5, value: 'America/Detroit' },
];
exports.defaultCollegeTimeZone = {
    offset: 6,
    label: 'Central',
    shortForm: 'CST',
    value: 'America/Chicago',
};
//# sourceMappingURL=college.model.js.map