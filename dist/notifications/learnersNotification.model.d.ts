import * as mongoose from 'mongoose';
export declare enum LearnerNotificationsIdentifiers {
    COURSE_START = "courseStart",
    ENROLLMENT_DEADLINE = "enrollmentDeadline",
    ENROLLMENT_STATUS = "enrollmentStatus",
    RELATED_COURSE = "relatedCourse",
    REFUND_REQUEST = "refundRequest",
    COURSE_REVIEW = "courseReview",
    PARTNER_REQUEST = "partnerRequest",
    REVIEW_REPORTED = "reviewReported",
    NEW_ENQUIRY = "newEnquiry",
    NEW_MESSAGE = "newMessage",
    NEW_CHAT = "newChat",
    CREATED_CHAT = "createdChat",
    SOURCE_TALENT_REQUEST = "sourceTalentRequest"
}
export declare const LearnersNotificationSchema: mongoose.Schema<any>;
export interface LearnerNotification extends mongoose.Document {
    receiver: string;
    identifier: string;
    content: string;
    course?: string;
    enrollment?: string;
    college?: string;
    isSeen?: string;
}
