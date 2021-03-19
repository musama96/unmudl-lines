"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var PostReportStatus;
(function (PostReportStatus) {
    PostReportStatus["Ignored"] = "ignored";
    PostReportStatus["Warned"] = "warned";
    PostReportStatus["Delete"] = "deleted";
})(PostReportStatus = exports.PostReportStatus || (exports.PostReportStatus = {}));
exports.EmployerPostReportSchema = new mongoose.Schema({
    post: { type: mongoose.Types.ObjectId, ref: 'posts' },
    reply: { type: mongoose.Types.ObjectId, ref: 'replies' },
    reportingUsers: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'users' }],
    reportingLearners: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'learners' }],
    status: { type: String, default: 'pending' },
}, {
    timestamps: true,
});
exports.EmployerPostReportSchema.query.paginate = function (page, perPage) {
    page = parseInt(String(page), 10);
    perPage = parseInt(String(perPage), 10);
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=employer-post-report.model.js.map