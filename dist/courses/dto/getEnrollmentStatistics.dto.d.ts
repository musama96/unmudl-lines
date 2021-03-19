declare enum StatsFilter {
    UNDERENROLLED = "underenrolled",
    OVERENROLLED = "overenrolled"
}
export declare class GetEnrollmentStatisticsDto {
    filter: StatsFilter;
    page: number;
    perPage: number;
    collegeId?: string;
}
export {};
