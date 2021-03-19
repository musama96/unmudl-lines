"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.BugReportSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Types.ObjectId, ref: 'learners' },
    title: { type: String, required: true },
    description: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    status: { type: String, enum: ['pending', 'reviewed'] },
    comment: { type: String },
    resolvedBy: { type: mongoose.Types.ObjectId, ref: 'users' },
    resolvedAt: { type: Date },
}, {
    timestamps: true,
});
//# sourceMappingURL=bug-report.model.js.map