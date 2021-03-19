"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var EmployerAdminNotificationTypes;
(function (EmployerAdminNotificationTypes) {
    EmployerAdminNotificationTypes["ALERT"] = "alert";
    EmployerAdminNotificationTypes["SALES"] = "sales";
    EmployerAdminNotificationTypes["HELP_AND_SUPPORT"] = "help&support";
})(EmployerAdminNotificationTypes = exports.EmployerAdminNotificationTypes || (exports.EmployerAdminNotificationTypes = {}));
var EmployerAdminNotificationsIdentifiers;
(function (EmployerAdminNotificationsIdentifiers) {
    EmployerAdminNotificationsIdentifiers["NEW_MESSAGE"] = "newMessage";
    EmployerAdminNotificationsIdentifiers["NEW_CHAT"] = "newChat";
    EmployerAdminNotificationsIdentifiers["CREATED_CHAT"] = "createdChat";
    EmployerAdminNotificationsIdentifiers["EMPLOYER_JOINED"] = "employerAdminJoined";
    EmployerAdminNotificationsIdentifiers["PROPOSAL_RESPONSE"] = "proposalResponse";
    EmployerAdminNotificationsIdentifiers["FORUM_POST"] = "forumPost";
    EmployerAdminNotificationsIdentifiers["FORUM_COMMENT"] = "forumComment";
    EmployerAdminNotificationsIdentifiers["FORUM_REPLY"] = "forumReply";
})(EmployerAdminNotificationsIdentifiers = exports.EmployerAdminNotificationsIdentifiers || (exports.EmployerAdminNotificationsIdentifiers = {}));
exports.EmployerAdminsNotificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'employerAdmins' },
    from: { type: mongoose.Schema.Types.ObjectId },
    fromType: { type: String, enum: ['user', 'learner', 'employerAdmin'] },
    identifier: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, required: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chats' },
    chatModule: { type: String, enum: ['internal-chat', 'employer-proposal-response', 'source-talent', 'enquiries'] },
    chatMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'messages' },
    proposalResponse: { type: mongoose.Schema.Types.ObjectId, ref: 'contact-college-responses' },
    isSeen: { type: Boolean, default: false },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    modifiedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    forumPost: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-posts' },
    forumComment: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-comments' },
    forumReply: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-replies' },
}, {
    timestamps: true,
});
exports.EmployerAdminsNotificationSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=employerAdminsNotification.model.js.map