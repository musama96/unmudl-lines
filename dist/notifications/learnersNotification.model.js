"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var LearnerNotificationsIdentifiers;
(function (LearnerNotificationsIdentifiers) {
    LearnerNotificationsIdentifiers["COURSE_START"] = "courseStart";
    LearnerNotificationsIdentifiers["ENROLLMENT_DEADLINE"] = "enrollmentDeadline";
    LearnerNotificationsIdentifiers["ENROLLMENT_STATUS"] = "enrollmentStatus";
    LearnerNotificationsIdentifiers["RELATED_COURSE"] = "relatedCourse";
    LearnerNotificationsIdentifiers["REFUND_REQUEST"] = "refundRequest";
    LearnerNotificationsIdentifiers["COURSE_REVIEW"] = "courseReview";
    LearnerNotificationsIdentifiers["PARTNER_REQUEST"] = "partnerRequest";
    LearnerNotificationsIdentifiers["REVIEW_REPORTED"] = "reviewReported";
    LearnerNotificationsIdentifiers["NEW_ENQUIRY"] = "newEnquiry";
    LearnerNotificationsIdentifiers["NEW_MESSAGE"] = "newMessage";
    LearnerNotificationsIdentifiers["NEW_CHAT"] = "newChat";
    LearnerNotificationsIdentifiers["CREATED_CHAT"] = "createdChat";
    LearnerNotificationsIdentifiers["SOURCE_TALENT_REQUEST"] = "sourceTalentRequest";
})(LearnerNotificationsIdentifiers = exports.LearnerNotificationsIdentifiers || (exports.LearnerNotificationsIdentifiers = {}));
exports.LearnersNotificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    from: { type: mongoose.Schema.Types.ObjectId },
    fromType: { type: String, enum: ['user', 'learner', 'employerAdmin'] },
    identifier: { type: String, required: true },
    content: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'enrollments' },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'enquiries' },
    enquiryMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'enquiry-messages' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chats' },
    chatModule: { type: String, enum: ['internal-chat', 'employer-proposal-response', 'source-talent', 'enquiries'] },
    chatMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'messages' },
    isSeen: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.LearnersNotificationSchema.query.paginate = function (page, perPage) {
    return this.skip((page - 1) * perPage).limit(perPage);
};
//# sourceMappingURL=learnersNotification.model.js.map