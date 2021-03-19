"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CourseCategorySchema = new mongoose.Schema({
    title: { type: String, required: true },
}, {
    timestamps: true,
});
exports.CourseCategorySchema.query.byKeyword = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=course-categories.model.js.map