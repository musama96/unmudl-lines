export declare enum ResolveReportedActivityStatusEnum {
    IGNORE = "ignore",
    WARNED = "warned",
    SUSPENDED = "suspended"
}
export declare class ResolveReportedActivityDto {
    reportedActivityId: string;
    status: ResolveReportedActivityStatusEnum;
}
