"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CourseFieldSchema = new mongoose.Schema({
    coverPhoto: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    title: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    altTag: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    url: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    price: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    enrollmentsAllowed: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    enrollmentDeadline: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    instructorIds: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    address: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    coordinates: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    date: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    time: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    hoursOffered: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    attendanceInformation: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    description: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    outline: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    eligibilityRestriction: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    skillOutcomes: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    performanceOutcomes: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    credentialPathway: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    attachments: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
    relatedCourse: {
        required: { type: Boolean },
        placeholder: { type: String },
        show: { type: Boolean, default: true },
    },
});
//# sourceMappingURL=course-fields.model.js.map