"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerIndustrySchema = new mongoose.Schema({
    title: { type: String, trim: true },
    NAICS_codes: { type: String },
}, {
    timestamps: true,
});
//# sourceMappingURL=employer-industry.model.js.map