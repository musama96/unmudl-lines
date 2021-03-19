"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CollegeTokenSchema = new mongoose.Schema({
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    token: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now, expires: 2592000 },
});
//# sourceMappingURL=collegeToken.model.js.map