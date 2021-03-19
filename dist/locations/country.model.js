"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CountrySchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: Number },
});
exports.CountrySchema.query.byName = function (keyword) {
    return this.where({ name: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=country.model.js.map