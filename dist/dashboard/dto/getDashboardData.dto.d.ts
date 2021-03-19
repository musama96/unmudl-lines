declare enum UserType {
    COLLEGE = "college",
    UNMUDL = "unmudl"
}
declare enum Filter {
    UNDERENROLLED = "underenrolled",
    OVERENROLLED = "overenrolled"
}
export declare class GetDashboardDataDto {
    start?: string;
    end?: string;
    graphStart?: string;
    graphEnd?: string;
    page: number;
    perPage: number;
    sort?: boolean;
    interval?: number;
    refundRate?: number;
    rejectionRate?: number;
    filter?: Filter;
    type: UserType;
    collegeId?: string;
    isUnmudlAdmin?: boolean;
    userCollegeId?: string;
}
export {};
