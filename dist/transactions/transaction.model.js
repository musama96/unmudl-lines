"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.TransactionSchema = new mongoose.Schema({
    collegeId: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    courseId: { type: mongoose.Types.ObjectId, ref: 'courses' },
    amount: { type: Number, required: true },
}, {
    timestamps: true,
});
//# sourceMappingURL=transaction.model.js.map