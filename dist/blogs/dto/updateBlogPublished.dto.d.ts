declare enum PublishedStatus {
    PUBLISHED = "published",
    UNPUBLISHED = "unpublished",
    DENIED = "denied"
}
export declare class UpdateBlogPublishedDto {
    blogId: string;
    status: PublishedStatus;
}
export {};
