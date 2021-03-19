"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerPostTagSchema = new mongoose.Schema({
    title: { type: String, required: true },
}, {
    timestamps: true,
});
exports.EmployerPostTagSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
exports.EmployerPostTagSchema.query.byKeyword = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=employer-post-tag.model.js.map