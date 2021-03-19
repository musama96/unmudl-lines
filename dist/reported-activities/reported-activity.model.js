"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.ReportedActivitySchema = new mongoose.Schema({
    reviewId: { type: mongoose.Types.ObjectId, ref: 'reviews' },
    status: { type: String, enum: ['pending', 'warned', 'suspended', 'ignored'] },
    reportedLearnerId: { type: mongoose.Types.ObjectId, ref: 'learners' },
    reportingLearnerId: { type: mongoose.Types.ObjectId, ref: 'learners' },
    reportingCollegeId: { type: mongoose.Types.ObjectId, ref: 'users' },
    reportingUserId: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    resolutionDate: { type: Date },
    reportDate: { type: Date },
    reviewDate: { type: Date },
    comment: { type: String },
}, {
    timestamps: true,
});
//# sourceMappingURL=reported-activity.model.js.map