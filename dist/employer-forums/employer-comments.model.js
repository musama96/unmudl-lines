"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerCommentSchema = new mongoose.Schema({
    employerPost: { type: mongoose.Types.ObjectId, ref: 'employer-posts' },
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    employerAdmin: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    content: { type: String, trim: true },
    totalReplies: { type: Number, required: false, default: 0 },
}, {
    timestamps: true,
});
exports.EmployerCommentSchema.query.byPost = function (postId) {
    return this.where({ employerPost: mongoose.Types.ObjectId(postId) });
};
exports.EmployerCommentSchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=employer-comments.model.js.map