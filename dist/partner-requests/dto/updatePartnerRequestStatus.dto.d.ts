export declare enum PartnerRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class UpdatePartnerRequestStatusDto {
    partnerRequestId: string;
    status: PartnerRequestStatus;
}
