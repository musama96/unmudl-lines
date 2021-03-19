"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.PostTagSchema = new mongoose.Schema({
    title: { type: String, required: true },
}, {
    timestamps: true,
});
exports.PostTagSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
exports.PostTagSchema.query.byKeyword = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=post-tag.model.js.map