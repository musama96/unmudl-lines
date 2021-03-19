declare enum SearchType {
    KEYWORD = "keyword",
    LOCATION = "location"
}
export declare class LearnersListDto {
    keyword: string;
    searchBy: SearchType;
    lat?: number;
    lng?: number;
    sortBy?: string;
    sortOrder?: string;
    page: number;
    perPage: number;
    collegeId?: string;
    courseId?: string;
}
export {};
