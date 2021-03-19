declare enum SearchBy {
    KEYWORD = "keyword",
    COORDINATES = "coordinates"
}
export declare class EnrollmentLearnersListDto {
    keyword: string;
    page: number;
    perPage: number;
    searchBy: SearchBy;
    collegeId?: string;
    courseId?: string;
}
export {};
