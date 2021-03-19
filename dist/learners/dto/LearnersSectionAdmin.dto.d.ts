declare enum LearnersSearchType {
    KEYWORD = "keyword",
    LOCATION = "location"
}
export declare class LearnersSectionAdminDto {
    userGrowthStart?: string;
    userGrowthEnd?: string;
    graphStart?: string;
    graphEnd?: string;
    learnersStart?: string;
    learnersEnd?: string;
    searchBy: LearnersSearchType;
    interval?: number;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: string;
    lat?: number;
    lng?: number;
    keyword?: string;
    collegeId?: string;
    start?: string;
    end?: string;
}
export {};
