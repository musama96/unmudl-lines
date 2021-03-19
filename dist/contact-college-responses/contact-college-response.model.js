"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.ContactCollegeResponseSchema = new mongoose.Schema({
    college: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    chat: { type: mongoose.Types.ObjectId, ref: 'chats' },
    appliedBy: { type: mongoose.Types.ObjectId, ref: 'users' },
    proposedBy: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    users: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    proposal: { type: mongoose.Types.ObjectId, ref: 'contact-college-proposals' },
    description: { type: String },
    attachments: [{ filename: { type: String }, path: { type: String } }],
}, { timestamps: true });
//# sourceMappingURL=contact-college-response.model.js.map