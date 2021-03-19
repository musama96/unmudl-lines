"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.StateSchema = new mongoose.Schema({
    abbreviation: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    name: { type: String, required: true },
});
exports.StateSchema.query.byName = function (keyword) {
    return this.where({ name: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=state.model.js.map