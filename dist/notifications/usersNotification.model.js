"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var UserNotificationTypes;
(function (UserNotificationTypes) {
    UserNotificationTypes["ALERT"] = "alert";
    UserNotificationTypes["SALES"] = "sales";
    UserNotificationTypes["HELP_AND_SUPPORT"] = "help&support";
})(UserNotificationTypes = exports.UserNotificationTypes || (exports.UserNotificationTypes = {}));
var UserNotificationsIdentifiers;
(function (UserNotificationsIdentifiers) {
    UserNotificationsIdentifiers["INSTRUCTOR_ADDED"] = "instructorAdded";
    UserNotificationsIdentifiers["COURSE_EDITED"] = "courseEdited";
    UserNotificationsIdentifiers["COURSE_DEADLINE"] = "courseDeadline";
    UserNotificationsIdentifiers["ENROLLMENT_CLOSED"] = "enrollmentClosed";
    UserNotificationsIdentifiers["NEW_MESSAGE"] = "newMessage";
    UserNotificationsIdentifiers["NEW_ENQUIRY"] = "newEnquiry";
    UserNotificationsIdentifiers["NEW_CHAT"] = "newChat";
    UserNotificationsIdentifiers["CREATED_CHAT"] = "createdChat";
    UserNotificationsIdentifiers["DAILY_ENROLLMENTS"] = "dailyEnrollments";
    UserNotificationsIdentifiers["DAILY_REVENUE"] = "dailyRevenue";
    UserNotificationsIdentifiers["COURSE_ADDED"] = "courseAdded";
    UserNotificationsIdentifiers["PROMO_ADDED"] = "promoAdded";
    UserNotificationsIdentifiers["PERMISSION_LEVEL"] = "permissionLevel";
    UserNotificationsIdentifiers["BLOG_STATUS"] = "blogStatus";
    UserNotificationsIdentifiers["REFUND_REQUEST"] = "refundRequest";
    UserNotificationsIdentifiers["COLLEGE_JOINED"] = "collegeJoined";
    UserNotificationsIdentifiers["EMPLOYER_JOINED"] = "employerJoined";
    UserNotificationsIdentifiers["USER_JOINED"] = "userJoined";
    UserNotificationsIdentifiers["NEW_PROPOSAL"] = "newProposal";
    UserNotificationsIdentifiers["SOURCE_TALENT_REQUEST"] = "sourceTalentRequest";
    UserNotificationsIdentifiers["EMPLOYER_FORUM_POST"] = "employerForumPost";
    UserNotificationsIdentifiers["EMPLOYER_FORUM_COMMENT"] = "employerForumComment";
    UserNotificationsIdentifiers["EMPLOYER_FORUM_REPLY"] = "employerForumReply";
})(UserNotificationsIdentifiers = exports.UserNotificationsIdentifiers || (exports.UserNotificationsIdentifiers = {}));
exports.UsersNotificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    from: { type: mongoose.Schema.Types.ObjectId },
    fromType: { type: String, enum: ['user', 'learner', 'employerAdmin'] },
    identifier: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String },
    channel: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    modifiedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    promo: { type: mongoose.Schema.Types.ObjectId, ref: 'promos' },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'enrollments' },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    employerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-companies' },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    chatGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'chat-groups' },
    chatMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'chat-messages' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chats' },
    chatModule: { type: String, enum: ['internal-chat', 'employer-proposal-response', 'source-talent', 'enquiries'] },
    message: { type: mongoose.Schema.Types.ObjectId, ref: 'messages' },
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'enquiries' },
    enquiryMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'enquiry-messages' },
    collegeProposal: { type: mongoose.Schema.Types.ObjectId, ref: 'contact-college-proposals' },
    employerForumPost: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-posts' },
    employerForumComment: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-comments' },
    employerForumReply: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-replies' },
    isSeen: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.UsersNotificationSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=usersNotification.model.js.map