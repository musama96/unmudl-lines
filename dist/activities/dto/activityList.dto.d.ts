declare enum ActivityType {
    USER = "user",
    TRANSACTION = "transaction"
}
export declare class ActivityListDto {
    type: ActivityType;
    start?: string;
    end?: string;
    userId?: string;
    learnerId?: string;
    courseId?: string;
    page?: number;
    perPage?: number;
}
export {};
