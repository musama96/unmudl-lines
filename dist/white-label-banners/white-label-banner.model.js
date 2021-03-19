"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.WhiteLabelBannerSchema = new mongoose.Schema({
    title: { type: String },
    identifier: { type: String },
    description: { type: String },
    live: { type: Boolean, default: false },
}, {
    timestamps: true,
});
//# sourceMappingURL=white-label-banner.model.js.map