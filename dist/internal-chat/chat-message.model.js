"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.ChatMessageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Types.ObjectId, ref: 'chat-groups' },
    message: { type: String },
    from: { type: mongoose.Types.ObjectId, ref: 'users' },
    readBy: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
}, {
    timestamps: true,
});
//# sourceMappingURL=chat-message.model.js.map