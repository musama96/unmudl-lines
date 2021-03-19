"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerPostSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    employerAdmin: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    totalComments: { type: Number, required: false, default: 0 },
    topic: { type: String, trim: true },
    content: { type: String, trim: true },
    tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'employer-post-tags' }],
}, {
    timestamps: true,
});
exports.EmployerPostSchema.query.byTopic = function (keyword) {
    return this.where({ topic: { $regex: keyword, $options: 'i' } });
};
exports.EmployerPostSchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=employer-posts.model.js.map