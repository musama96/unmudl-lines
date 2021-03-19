export declare enum Status {
    Pending = "pending",
    Draft = "draft",
    Published = "published",
    Unpublished = "unpublished",
    Featured = "featured",
    Submitted = "submitted"
}
export declare class BlogsListDto {
    status?: Status;
    keyword?: string;
    page?: number;
    perPage?: number;
    sortOrder?: string;
    sortBy?: string;
    collegeId?: string;
    employerId?: string;
}
