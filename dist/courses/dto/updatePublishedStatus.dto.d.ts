declare enum UpdatePublishStatus {
    LIVE = "live",
    COMING_SOON = "coming_soon",
    UNPUBLISH = "unpublished"
}
export declare class UpdatePublishedStatusDto {
    _id: string;
    status: UpdatePublishStatus;
    unpublishedDate?: string;
    unpublishedBy?: string;
}
export {};
