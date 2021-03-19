"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.UserTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    token: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now, expires: 2592000 },
});
//# sourceMappingURL=userToken.model.js.map