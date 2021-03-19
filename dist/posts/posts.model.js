"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.PostSchema = new mongoose.Schema({
    author: { type: mongoose.Types.ObjectId, ref: 'learners' },
    totalParticipants: { type: Number, required: false, default: 0 },
    totalReplies: { type: Number, required: false, default: 0 },
    topic: { type: String, trim: true },
    content: { type: String, trim: true },
    tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'post-tags' }],
    numId: { type: Number, unique: true },
}, {
    timestamps: true,
});
exports.PostSchema.query.byTopic = function (keyword) {
    return this.where({ topic: { $regex: keyword, $options: 'i' } });
};
exports.PostSchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=posts.model.js.map