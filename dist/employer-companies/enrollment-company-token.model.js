"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EnrollmentCompanyTokenSchema = new mongoose.Schema({
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-companies' },
    token: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now, expires: 2592000 },
});
//# sourceMappingURL=enrollment-company-token.model.js.map