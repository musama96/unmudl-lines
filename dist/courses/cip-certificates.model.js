"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CipCertificatesSchema = new mongoose.Schema({
    CIPTitle: { type: String, required: true },
    CIPCode: { type: String, required: true },
    CIPFamily: { type: String, required: false },
    Action: { type: String, required: false },
    TextChange: { type: String, required: false },
    CIPDefinition: { type: String, required: false },
    CrossReferences: { type: String, required: false },
    Examples: { type: String, required: false },
}, {
    timestamps: true,
});
exports.CipCertificatesSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
exports.CipCertificatesSchema.query.byKeyword = function (keyword) {
    return this.where({ CIPTitle: { $regex: keyword, $options: 'i' } });
};
//# sourceMappingURL=cip-certificates.model.js.map