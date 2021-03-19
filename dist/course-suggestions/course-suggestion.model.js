"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CourseSuggestionSchema = new mongoose.Schema({
    courseName: { type: String, required: true, trim: true },
    collegeName: { type: String, required: true, trim: true },
    isCourseCurrentlyOffered: { type: Boolean, default: true },
    moreInfo: { type: String, required: false, trim: true },
    contactInfo: { type: String, required: false, trim: true },
    status: { type: String, default: 'pending' },
}, {
    timestamps: true,
});
//# sourceMappingURL=course-suggestion.model.js.map