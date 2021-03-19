"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.PromoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    discount: { type: Number, required: true },
    date: {
        start: { type: Date, required: true },
        end: { type: Date },
    },
    applyTo: { type: String, enum: ['all', 'selected'], required: true },
    type: { type: String, enum: ['unmudl', 'both', 'gift'], required: true },
    status: { type: String, enum: ['active', 'suspended'], required: true },
    discountMetric: { type: String, enum: ['percentage', 'amount'], required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    addedByLearner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
    learners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'learners' }],
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
}, {
    timestamps: true,
});
exports.PromoSchema.query.byKeyword = function (keyword) {
    return this.where({
        title: {
            $regex: keyword,
            $options: 'i',
        },
    });
};
exports.PromoSchema.query.byCourse = function (courseId) {
    return this.where({
        courses: courseId,
    });
};
exports.PromoSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=promo.model.js.map