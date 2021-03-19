"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.BlogTagSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
}, {
    timestamps: true,
});
exports.BlogTagSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
exports.BlogTagSchema.query.byKeyword = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=blog-tag.model.js.map