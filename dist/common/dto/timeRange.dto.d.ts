declare enum HoursOffered {
    DAYTIME = "daytime",
    EVENING = "evening"
}
export declare class TimeRangeDto {
    hoursOffered: HoursOffered;
    start?: string;
    end?: string;
}
export {};
