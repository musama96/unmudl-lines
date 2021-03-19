declare enum UserType {
    COLLEGE = "college",
    UNMUDL = "unmudl"
}
export declare class LearnerAnalyticsCountDto {
    start?: string;
    end?: string;
    enrolled?: boolean;
    type: UserType;
    collegeId?: string;
}
export {};
