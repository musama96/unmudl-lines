export declare enum UserType {
    COLLEGE = "college",
    UNMUDL = "unmudl"
}
export declare class RevenueAnalyticsCountDto {
    start?: string;
    end?: string;
    graphStart?: string;
    graphEnd?: string;
    sort?: boolean;
    type?: UserType;
    collegeId?: string;
}
