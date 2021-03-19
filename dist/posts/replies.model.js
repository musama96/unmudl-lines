"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.ReplySchema = new mongoose.Schema({
    postId: { type: mongoose.Types.ObjectId, ref: 'posts' },
    learner: { type: mongoose.Types.ObjectId, ref: 'learners' },
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    content: { type: String, trim: true },
}, {
    timestamps: true,
});
exports.ReplySchema.query.byPost = function (postId) {
    return this.where({ postId: mongoose.Types.ObjectId(postId) });
};
exports.ReplySchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=replies.model.js.map