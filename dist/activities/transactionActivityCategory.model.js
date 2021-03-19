"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.TransactionActivities = {
    CourseApplied: 'courseApplied',
    CourseBought: 'courseBought',
    CourseBoughtWithPromo: 'courseBoughtWithPromo',
    EnrollmentApproved: 'enrollmentApproved',
    EnrollmentDeclined: 'enrollmentDeclined',
    EnrollmentCanceled: 'enrollmentCanceled',
    EnrollmentRefunded: 'enrollmentRefunded',
};
exports.TransactionActivityCategorySchema = new mongoose.Schema({
    name: { type: String, enum: ['courseApplied', 'courseBought', 'courseBoughtWithPromo', 'enrollmentApproved', 'enrollmentDeclined', 'enrollmentCanceled', 'enrollmentRefunded'], required: true },
    color: { type: String, required: true },
}, {
    timestamps: true,
});
exports.TransactionActivityCategorySchema.query.byName = function (name) {
    return this.where({
        name,
    });
};
//# sourceMappingURL=transactionActivityCategory.model.js.map