"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.PartnerGroupSchema = new mongoose.Schema({
    title: { type: String, required: true },
    color: { type: String, required: true },
}, {
    timestamps: true,
});
//# sourceMappingURL=partner-group.model.js.map