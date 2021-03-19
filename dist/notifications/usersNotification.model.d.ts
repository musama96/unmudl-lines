import * as mongoose from 'mongoose';
export declare enum UserNotificationTypes {
    ALERT = "alert",
    SALES = "sales",
    HELP_AND_SUPPORT = "help&support"
}
export declare enum UserNotificationsIdentifiers {
    INSTRUCTOR_ADDED = "instructorAdded",
    COURSE_EDITED = "courseEdited",
    COURSE_DEADLINE = "courseDeadline",
    ENROLLMENT_CLOSED = "enrollmentClosed",
    NEW_MESSAGE = "newMessage",
    NEW_ENQUIRY = "newEnquiry",
    NEW_CHAT = "newChat",
    CREATED_CHAT = "createdChat",
    DAILY_ENROLLMENTS = "dailyEnrollments",
    DAILY_REVENUE = "dailyRevenue",
    COURSE_ADDED = "courseAdded",
    PROMO_ADDED = "promoAdded",
    PERMISSION_LEVEL = "permissionLevel",
    BLOG_STATUS = "blogStatus",
    REFUND_REQUEST = "refundRequest",
    COLLEGE_JOINED = "collegeJoined",
    EMPLOYER_JOINED = "employerJoined",
    USER_JOINED = "userJoined",
    NEW_PROPOSAL = "newProposal",
    SOURCE_TALENT_REQUEST = "sourceTalentRequest",
    EMPLOYER_FORUM_POST = "employerForumPost",
    EMPLOYER_FORUM_COMMENT = "employerForumComment",
    EMPLOYER_FORUM_REPLY = "employerForumReply"
}
export declare const UsersNotificationSchema: mongoose.Schema<any>;
export interface UserNotification extends mongoose.Document {
    receiver?: string;
    identifier: string;
    content: string;
    type: string;
    course?: string;
    status?: string;
    channel?: string;
    enrollment?: string;
    college?: string;
    learner?: string;
    user?: string;
    modifiedUser?: string;
    isSeen?: string;
}
