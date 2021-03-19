"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var ReportLearnerStatus;
(function (ReportLearnerStatus) {
    ReportLearnerStatus["SUSPENDED"] = "suspended";
    ReportLearnerStatus["PENDING"] = "pending";
    ReportLearnerStatus["IGNORED"] = "ignored";
})(ReportLearnerStatus = exports.ReportLearnerStatus || (exports.ReportLearnerStatus = {}));
exports.ReportedLearnerSchema = new mongoose.Schema({
    learner: { type: mongoose.Types.ObjectId, ref: 'learners' },
    colleges: [{ type: mongoose.Types.ObjectId, ref: 'colleges' }],
    report: [{
            user: { type: mongoose.Types.ObjectId, ref: 'users' },
            reason: { type: String },
        }],
    status: { type: String, default: 'pending' },
}, {
    timestamps: true,
});
exports.ReportedLearnerSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=reported-learner.model.js.map