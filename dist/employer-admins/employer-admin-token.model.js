"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerAdminTokenSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    token: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now, expires: 2592000 },
});
//# sourceMappingURL=employer-admin-token.model.js.map