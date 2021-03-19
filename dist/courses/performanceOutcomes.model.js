"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.PerformanceOutcomesSchema = new mongoose.Schema({
    title: { type: String, required: true },
}, {
    timestamps: true,
});
exports.PerformanceOutcomesSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
exports.PerformanceOutcomesSchema.query.byKeyword = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=performanceOutcomes.model.js.map