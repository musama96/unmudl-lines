"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EmployerSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    website: { type: String, required: false },
    logo: { type: String, required: false },
}, {
    timestamps: true,
});
exports.EmployerSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
exports.EmployerSchema.query.byKeyword = function (keyword) {
    return this.where({ title: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=employer.model.js.map