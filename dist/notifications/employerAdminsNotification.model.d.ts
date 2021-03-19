import * as mongoose from 'mongoose';
export declare enum EmployerAdminNotificationTypes {
    ALERT = "alert",
    SALES = "sales",
    HELP_AND_SUPPORT = "help&support"
}
export declare enum EmployerAdminNotificationsIdentifiers {
    NEW_MESSAGE = "newMessage",
    NEW_CHAT = "newChat",
    CREATED_CHAT = "createdChat",
    EMPLOYER_JOINED = "employerAdminJoined",
    PROPOSAL_RESPONSE = "proposalResponse",
    FORUM_POST = "forumPost",
    FORUM_COMMENT = "forumComment",
    FORUM_REPLY = "forumReply"
}
export declare const EmployerAdminsNotificationSchema: mongoose.Schema<any>;
export interface EmployerAdminNotification extends mongoose.Document {
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
    employerAdmin?: string;
    modifiedEmployerAdmin?: string;
    isSeen?: string;
    forumPost?: string;
    forumComment?: string;
    forumReply?: string;
}
