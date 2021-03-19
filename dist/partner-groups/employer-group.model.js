"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerGroupSchema = new mongoose.Schema({
    title: { type: String, required: true },
    color: { type: String, required: true },
}, {
    timestamps: true,
});
//# sourceMappingURL=employer-group.model.js.map