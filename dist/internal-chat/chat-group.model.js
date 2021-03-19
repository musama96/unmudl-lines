"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.ChatGroupSchema = new mongoose.Schema({
    groupName: { type: String },
    groupPhoto: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'users' },
    members: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
}, {
    timestamps: true,
});
//# sourceMappingURL=chat-group.model.js.map