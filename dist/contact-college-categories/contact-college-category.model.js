"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.ContactCollegeCategorySchema = new mongoose.Schema({
    title: { type: String },
    subcategories: [{ title: String }],
    deletedAt: { type: Date, default: null },
}, {
    timestamps: true,
});
//# sourceMappingURL=contact-college-category.model.js.map