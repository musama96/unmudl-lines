declare enum UserType {
    COLLEGE = "college",
    UNMUDL = "unmudl"
}
export declare class AnalyticsCountDto {
    start?: string;
    end?: string;
    interval?: number;
    type: UserType;
    collegeId?: string;
}
export {};
