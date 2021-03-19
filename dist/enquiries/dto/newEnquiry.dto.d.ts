export declare enum MessageFrom {
    USER = "user",
    ADMIN = "admin"
}
export declare enum MessageStatus {
    READ = "read",
    UNREAD = "unread"
}
export declare class NewEnquiryDto {
    learner: string;
    course: string;
    from?: MessageFrom;
    message: string;
    collegeRep?: string;
    status?: MessageStatus;
}
