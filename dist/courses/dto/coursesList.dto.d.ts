export declare enum CourseListStatus {
    ALL = "all",
    PUBLISHED = "published",
    COMING_SOON = "coming_soon",
    UNPUBLISH = "unpublished"
}
export declare class CoursesListDto {
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;
    daysLeft?: number;
    open?: number;
    openApplied?: boolean;
    rating?: number;
    page?: number;
    perPage?: number;
    sortOrder?: string;
    sortBy?: string;
    collegeId?: string;
    instructorId?: string;
    status?: CourseListStatus;
    courseIds?: string[];
}
