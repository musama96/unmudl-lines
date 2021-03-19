"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.UnmudlAccessLogSchema = new mongoose.Schema({
    type: { type: String, enum: ['college', 'employer'] },
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    employer: { type: mongoose.Types.ObjectId, ref: 'employer-companies' },
    college: { type: mongoose.Types.ObjectId, ref: 'colleges' },
}, {
    timestamps: true,
});
//# sourceMappingURL=unmudl-access-log.model.js.map