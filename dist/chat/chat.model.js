"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var ChatType;
(function (ChatType) {
    ChatType["COLLEGE"] = "college";
    ChatType["EMPLOYER"] = "employer";
    ChatType["LEARNER"] = "learner";
})(ChatType = exports.ChatType || (exports.ChatType = {}));
exports.ChatSchema = new mongoose.Schema({
    groupName: { type: String, default: null },
    learner: { type: mongoose.Types.ObjectId, ref: 'learners' },
    employerAdmins: [{ type: mongoose.Types.ObjectId, ref: 'employer-admins' }],
    users: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    readByLearner: { type: Boolean },
    readByEmployerAdmins: [{ type: mongoose.Types.ObjectId, ref: 'employer-admins' }],
    readByUsers: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    college: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    employer: { type: mongoose.Types.ObjectId, ref: 'employer-companies' },
    type: { type: String, default: ChatType.COLLEGE },
    module: { type: String, enum: ['internal-chat', 'employer-proposal-response', 'source-talent', 'enquiries'], default: 'internal-chat' },
    moduleDocumentId: { type: mongoose.Types.ObjectId, default: null },
    createdBy: { type: mongoose.Types.ObjectId },
    createdByType: { type: String, enum: ['employerAdmin', 'user', 'learner'] },
    showToCreator: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, {
    timestamps: true,
});
//# sourceMappingURL=chat.model.js.map