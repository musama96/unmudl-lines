"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.CounterSchema = new mongoose.Schema({
    user: { type: Number, default: 26 },
    college: { type: Number, default: 13 },
    course: { type: Number, default: 18 },
    blog: { type: Number, default: 4 },
    post: { type: Number, default: 10 },
    draft: { type: Number, default: 15 },
    employer: { type: Number, default: 15 },
    employerAdmin: { type: Number, default: 15 },
});
//# sourceMappingURL=id-counter.model.js.map