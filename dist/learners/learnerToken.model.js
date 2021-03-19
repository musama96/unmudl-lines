"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.LearnerTokenSchema = new mongoose.Schema({
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    token: { type: String },
    verificationCode: { type: Number },
    date: { type: Date, required: true, default: Date.now, expires: 172800 },
});
//# sourceMappingURL=learnerToken.model.js.map