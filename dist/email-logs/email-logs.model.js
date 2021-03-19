"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var Portal;
(function (Portal) {
    Portal["COLLEGE"] = "college";
    Portal["ADMIN"] = "admin";
    Portal["LEARNER"] = "learner";
    Portal["EMPLOYER"] = "employer";
})(Portal = exports.Portal || (exports.Portal = {}));
exports.EmailLogSchema = new mongoose.Schema({
    to: { type: String, required: true },
    from: { type: String },
    subject: { type: String },
    template: { type: String },
    content: { type: String },
    portal: { type: String, enum: ['college', 'admin', 'learner', 'employer'] },
}, {
    timestamps: true,
});
//# sourceMappingURL=email-logs.model.js.map