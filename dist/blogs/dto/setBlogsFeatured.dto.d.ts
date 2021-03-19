export declare enum FeaturedStatus {
    FEATURE = "feature",
    UNFEATURE = "unfeature"
}
export declare class SetBlogsFeaturedDto {
    blogId: string;
    status: FeaturedStatus;
    update?: any;
}
