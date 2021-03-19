"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EnquirySchema = new mongoose.Schema({
    learner: { type: mongoose.Types.ObjectId, ref: 'learners' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    users: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
}, {
    timestamps: true,
});
//# sourceMappingURL=enquiry.model.js.map