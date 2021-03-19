"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.TaxRatesSchema = new mongoose.Schema({
    state: String,
    postalCode: String,
    taxRate: Number,
}, {
    timestamps: true,
});
//# sourceMappingURL=tax-rate.model.js.map