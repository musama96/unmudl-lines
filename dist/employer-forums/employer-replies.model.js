"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerReplySchema = new mongoose.Schema({
    employerComment: { type: mongoose.Types.ObjectId, ref: 'employer-comments' },
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    employerAdmin: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    content: { type: String, trim: true },
}, {
    timestamps: true,
});
exports.EmployerReplySchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=employer-replies.model.js.map